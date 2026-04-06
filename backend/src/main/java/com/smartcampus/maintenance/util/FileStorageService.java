package com.smartcampus.maintenance.util;

import com.smartcampus.maintenance.exception.BadRequestException;
import com.smartcampus.maintenance.exception.NotFoundException;
import com.smartcampus.maintenance.optimization.JavaImageOptimizer;
import com.smartcampus.maintenance.optimization.JavaImageOptimizer.OptimizedImageResult;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    public record StoredFile(Path path, String filename, String contentType) {
    }

    private final Path uploadPath;
    private final List<String> allowedContentTypes;
    private final long maxFileSizeBytes;
    private final int minSavingsPercent;
    private final int jpegQuality;
    private final int pngCompressionQuality;

    public FileStorageService(
            String uploadDir,
            List<String> allowedContentTypes,
            long maxFileSizeBytes) {
        this(uploadDir, allowedContentTypes, maxFileSizeBytes, 5, 85, 85);
    }

    @Autowired
    public FileStorageService(
            @Value("${app.upload.dir:uploads}") String uploadDir,
            @Value("${app.upload.allowed-content-types:image/jpeg,image/png,image/webp}") List<String> allowedContentTypes,
            @Value("${app.upload.max-file-size-bytes:5242880}") long maxFileSizeBytes,
            @Value("${app.image.optimization.min-savings-percent:5}") int minSavingsPercent,
            @Value("${app.image.optimization.jpeg-quality:85}") int jpegQuality,
            @Value("${app.image.optimization.png-compression-quality:85}") int pngCompressionQuality) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.allowedContentTypes = allowedContentTypes == null ? List.of() : allowedContentTypes.stream()
                .map(value -> value == null ? "" : value.trim().toLowerCase())
                .filter(value -> !value.isEmpty())
                .distinct()
                .toList();
        this.maxFileSizeBytes = maxFileSizeBytes;
        this.minSavingsPercent = Math.max(1, minSavingsPercent);
        this.jpegQuality = clampQuality(jpegQuality);
        this.pngCompressionQuality = clampQuality(pngCompressionQuality);
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not initialize upload directory", ex);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        validateImage(file);

        String normalizedContentType = normalizeContentType(file.getContentType());
        String extension = resolveExtension(normalizedContentType);
        String filename = UUID.randomUUID() + extension;
        Path target = uploadPath.resolve(filename);

        byte[] payload = readBytes(file);
        byte[] bytesToStore = maybeOptimizeImage(payload, normalizedContentType);

        try {
            Files.write(target, bytesToStore);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store file");
        }
        return filename;
    }

    public String canonicalStoredReference(String storedPath) {
        if (!StringUtils.hasText(storedPath)) {
            return null;
        }
        String normalized = storedPath.trim().replace('\\', '/');
        if (normalized.startsWith("/uploads/")) {
            normalized = normalized.substring("/uploads/".length());
        } else if (normalized.startsWith("uploads/")) {
            normalized = normalized.substring("uploads/".length());
        }
        String filename = Paths.get(normalized).getFileName().toString();
        if (!StringUtils.hasText(filename) || filename.contains("..")) {
            throw new NotFoundException("Attachment not found");
        }
        return filename;
    }

    public StoredFile load(String storedPath) {
        String filename = canonicalStoredReference(storedPath);
        if (!StringUtils.hasText(filename)) {
            throw new NotFoundException("Attachment not found");
        }
        Path target = uploadPath.resolve(filename).normalize();
        if (!target.startsWith(uploadPath) || !Files.exists(target) || !Files.isRegularFile(target)) {
            throw new NotFoundException("Attachment not found");
        }
        return new StoredFile(target, filename, detectContentType(target, filename));
    }

    private void validateImage(MultipartFile file) {
        if (maxFileSizeBytes > 0 && file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("File exceeds the maximum allowed size.");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!allowedContentTypes.contains(contentType)) {
            throw new BadRequestException("Unsupported file type. Only JPG, PNG, and WEBP images are allowed.");
        }
        if (!hasExpectedFileSignature(file, contentType)) {
            throw new BadRequestException("Uploaded file content does not match the declared image type.");
        }
    }

    private String resolveExtension(String contentType) {
        return switch (normalizeContentType(contentType)) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new BadRequestException("Unsupported file type. Only JPG, PNG, and WEBP images are allowed.");
        };
    }

    private String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return "";
        }
        return contentType.trim().toLowerCase();
    }

    private byte[] maybeOptimizeImage(byte[] originalBytes, String contentType) {
        return JavaImageOptimizer.optimize(
                        contentType,
                        originalBytes,
                        minSavingsPercent,
                        jpegQuality,
                        pngCompressionQuality)
                .filter(result -> isOptimizationUsable(result, contentType, originalBytes.length))
                .map(OptimizedImageResult::bytes)
                .orElse(originalBytes);
    }

    private boolean isOptimizationUsable(OptimizedImageResult result, String expectedContentType, int originalSize) {
        if (result == null || result.bytes() == null || result.bytes().length == 0) {
            return false;
        }
        if (!normalizeContentType(expectedContentType).equals(normalizeContentType(result.contentType()))) {
            return false;
        }
        if (result.originalWidth() <= 0
                || result.originalHeight() <= 0
                || result.originalWidth() != result.optimizedWidth()
                || result.originalHeight() != result.optimizedHeight()) {
            return false;
        }
        if (!hasExpectedFileSignature(result.bytes(), expectedContentType)) {
            return false;
        }
        if (result.bytes().length >= originalSize) {
            return false;
        }

        int savingsPercent = (int) Math.floor(((originalSize - result.bytes().length) * 100.0) / originalSize);
        return savingsPercent >= minSavingsPercent;
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read uploaded file.");
        }
    }

    private int clampQuality(int quality) {
        return Math.max(1, Math.min(100, quality));
    }

    private String detectContentType(Path path, String filename) {
        try {
            String detected = Files.probeContentType(path);
            if (StringUtils.hasText(detected)) {
                return detected;
            }
        } catch (IOException ex) {
            // Fall back to extension-based detection below.
        }
        String normalized = filename.toLowerCase();
        if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (normalized.endsWith(".png")) {
            return "image/png";
        }
        if (normalized.endsWith(".webp")) {
            return "image/webp";
        }
        return "application/octet-stream";
    }

    private boolean hasExpectedFileSignature(MultipartFile file, String contentType) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(12);
            return hasExpectedFileSignature(header, contentType);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to inspect uploaded file.");
        }
    }

    private boolean hasExpectedFileSignature(byte[] bytes, String contentType) {
        byte[] header = bytes == null ? new byte[0] : bytes;
        if (header.length < 4) {
            return false;
        }
        return switch (normalizeContentType(contentType)) {
            case "image/jpeg", "image/jpg" -> (header[0] & 0xFF) == 0xFF
                    && (header[1] & 0xFF) == 0xD8
                    && (header[2] & 0xFF) == 0xFF;
            case "image/png" -> header.length >= 8
                    && (header[0] & 0xFF) == 0x89
                    && header[1] == 'P'
                    && header[2] == 'N'
                    && header[3] == 'G';
            case "image/webp" -> header.length >= 12
                    && header[0] == 'R'
                    && header[1] == 'I'
                    && header[2] == 'F'
                    && header[3] == 'F'
                    && header[8] == 'W'
                    && header[9] == 'E'
                    && header[10] == 'B'
                    && header[11] == 'P';
            default -> false;
        };
    }
}
