package com.smartcampus.maintenance.optimization;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.Optional;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

public final class JavaImageOptimizer {

    public record OptimizedImageResult(
            byte[] bytes,
            String contentType,
            int originalWidth,
            int originalHeight,
            int optimizedWidth,
            int optimizedHeight) {
    }

    private JavaImageOptimizer() {
    }

    public static Optional<OptimizedImageResult> optimize(
            String contentType,
            byte[] originalBytes,
            int minSavingsPercent,
            int jpegQuality,
            int pngCompressionQuality) {
        if (originalBytes == null || originalBytes.length == 0) {
            return Optional.empty();
        }

        String normalizedContentType = normalizeContentType(contentType);
        BufferedImage originalImage = decode(originalBytes).orElse(null);
        if (originalImage == null) {
            return Optional.empty();
        }

        byte[] optimizedBytes = switch (normalizedContentType) {
            case "image/jpeg", "image/jpg" -> encodeJpeg(originalImage, jpegQuality).orElse(null);
            case "image/png" -> encodePng(originalImage, pngCompressionQuality).orElse(null);
            case "image/webp" -> null;
            default -> null;
        };

        if (optimizedBytes == null || optimizedBytes.length >= originalBytes.length) {
            return Optional.empty();
        }

        int safeMinSavingsPercent = Math.max(1, minSavingsPercent);
        int savingsPercent = (int) Math.floor(((originalBytes.length - optimizedBytes.length) * 100.0) / originalBytes.length);
        if (savingsPercent < safeMinSavingsPercent) {
            return Optional.empty();
        }

        return Optional.of(new OptimizedImageResult(
                optimizedBytes,
                normalizedContentType,
                originalImage.getWidth(),
                originalImage.getHeight(),
                originalImage.getWidth(),
                originalImage.getHeight()));
    }

    private static Optional<BufferedImage> decode(byte[] imageBytes) {
        try (ByteArrayInputStream input = new ByteArrayInputStream(imageBytes)) {
            return Optional.ofNullable(ImageIO.read(input));
        } catch (IOException ex) {
            return Optional.empty();
        }
    }

    private static Optional<byte[]> encodeJpeg(BufferedImage source, int quality) {
        BufferedImage rgbSource = ensureRgb(source);
        return encodeWithWriter(rgbSource, "jpeg", quality);
    }

    private static Optional<byte[]> encodePng(BufferedImage source, int quality) {
        return encodeWithWriter(source, "png", quality);
    }

    private static Optional<byte[]> encodeWithWriter(
            BufferedImage source,
            String formatName,
            int quality) {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName(formatName);
        if (!writers.hasNext()) {
            return Optional.empty();
        }

        ImageWriter writer = writers.next();
        try (ByteArrayOutputStream outputBytes = new ByteArrayOutputStream();
                ImageOutputStream imageOutput = ImageIO.createImageOutputStream(outputBytes)) {
            writer.setOutput(imageOutput);

            ImageWriteParam writeParam = writer.getDefaultWriteParam();
            if (writeParam.canWriteCompressed()) {
                writeParam.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                float normalizedQuality = clampQuality(quality) / 100.0f;
                writeParam.setCompressionQuality(normalizedQuality);
            }

            writer.write(null, new IIOImage(source, null, null), writeParam);
            writer.dispose();
            return Optional.of(outputBytes.toByteArray());
        } catch (IOException | IllegalArgumentException ex) {
            writer.dispose();
            return Optional.empty();
        }
    }

    private static BufferedImage ensureRgb(BufferedImage source) {
        if (source.getType() == BufferedImage.TYPE_INT_RGB) {
            return source;
        }
        BufferedImage rgbImage = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = rgbImage.createGraphics();
        try {
            graphics.drawImage(source, 0, 0, null);
        } finally {
            graphics.dispose();
        }
        return rgbImage;
    }

    private static int clampQuality(int quality) {
        return Math.max(1, Math.min(100, quality));
    }

    private static String normalizeContentType(String contentType) {
        if (contentType == null) {
            return "";
        }
        return contentType.trim().toLowerCase();
    }
}
