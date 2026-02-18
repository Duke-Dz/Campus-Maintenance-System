package com.smartcampus.maintenance.util;

import com.smartcampus.maintenance.exception.BadRequestException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
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

        String extension = resolveExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Path target = uploadPath.resolve(filename);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store file");
        }
        return "/uploads/" + filename;
    }

    private String resolveExtension(String originalFilename) {
        String clean = StringUtils.hasText(originalFilename) ? originalFilename.trim() : "";
        int idx = clean.lastIndexOf('.');
        if (idx < 0 || idx == clean.length() - 1) {
            return "";
        }
        String ext = clean.substring(idx).toLowerCase();
        if (ext.length() > 10) {
            return "";
        }
        return ext;
    }
}
