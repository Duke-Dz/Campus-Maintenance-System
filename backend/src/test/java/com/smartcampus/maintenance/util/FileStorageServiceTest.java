package com.smartcampus.maintenance.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.smartcampus.maintenance.exception.BadRequestException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

class FileStorageServiceTest {

    private static final byte[] PNG_BYTES = new byte[] {
        (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D
    };
    private static final byte[] WEBP_BYTES = new byte[] {
        'R', 'I', 'F', 'F', 0x00, 0x00, 0x00, 0x00, 'W', 'E', 'B', 'P'
    };

    @TempDir
    Path tempDir;

    @Test
    void storesSupportedImagesUsingSafeGeneratedNames() throws Exception {
        FileStorageService service = new FileStorageService(
            tempDir.toString(),
            List.of("image/jpeg", "image/png", "image/webp"),
            5_242_880L
        );
        MockMultipartFile file = new MockMultipartFile(
            "image",
            "ticket.png",
            "image/png",
            PNG_BYTES
        );

        String storedPath = service.store(file);

        assertThat(storedPath).endsWith(".png");
        assertThat(Files.exists(tempDir.resolve(storedPath))).isTrue();
    }

    @Test
    void rejectsUnsupportedFileTypes() {
        FileStorageService service = new FileStorageService(
            tempDir.toString(),
            List.of("image/jpeg", "image/png", "image/webp"),
            5_242_880L
        );
        MockMultipartFile file = new MockMultipartFile(
            "image",
            "ticket.txt",
            "text/plain",
            "not-an-image".getBytes()
        );

        assertThatThrownBy(() -> service.store(file))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Unsupported file type");
    }

    @Test
    void rejectsFilesAboveConfiguredSize() {
        FileStorageService service = new FileStorageService(
            tempDir.toString(),
            List.of("image/jpeg", "image/png", "image/webp"),
            4L
        );
        MockMultipartFile file = new MockMultipartFile(
            "image",
            "ticket.png",
            "image/png",
            "oversized".getBytes()
        );

        assertThatThrownBy(() -> service.store(file))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("maximum allowed size");
    }

    @Test
    void rejectsImageWhenSignatureDoesNotMatchContentType() {
        FileStorageService service = new FileStorageService(
            tempDir.toString(),
            List.of("image/jpeg", "image/png", "image/webp"),
            5_242_880L
        );
        MockMultipartFile file = new MockMultipartFile(
            "image",
            "ticket.png",
            "image/png",
            "not-a-real-png".getBytes()
        );

        assertThatThrownBy(() -> service.store(file))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("declared image type");
    }

    @Test
    void canonicalStoredReferenceSupportsLegacyUploadUrls() {
        FileStorageService service = new FileStorageService(
            tempDir.toString(),
            List.of("image/jpeg", "image/png", "image/webp"),
            5_242_880L
        );

        assertThat(service.canonicalStoredReference("/uploads/example.png")).isEqualTo("example.png");
    }

    @Test
    void keepsOriginalBytesWhenJavaOptimizerCannotDecodeImage() throws Exception {
        FileStorageService service = new FileStorageService(
            tempDir.toString(),
            List.of("image/jpeg", "image/png", "image/webp"),
            5_242_880L,
            5,
            85,
            85
        );
        MockMultipartFile file = new MockMultipartFile(
            "image",
            "ticket.png",
            "image/png",
            PNG_BYTES
        );

        String storedPath = service.store(file);

        assertThat(Files.readAllBytes(tempDir.resolve(storedPath))).isEqualTo(PNG_BYTES);
    }

    @Test
    void keepsOriginalBytesForWebpWithoutPureJavaEncoder() throws Exception {
        FileStorageService service = new FileStorageService(
            tempDir.toString(),
            List.of("image/jpeg", "image/png", "image/webp"),
            5_242_880L,
            5,
            85,
            85
        );
        MockMultipartFile file = new MockMultipartFile(
            "image",
            "ticket.webp",
            "image/webp",
            WEBP_BYTES
        );

        String storedPath = service.store(file);

        assertThat(Files.readAllBytes(tempDir.resolve(storedPath))).isEqualTo(WEBP_BYTES);
    }
}
