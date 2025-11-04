package bg.softuni.stylemint.common.service;

import bg.softuni.stylemint.common.exception.FileProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.function.Consumer;

@Service
@Slf4j
public class FileService {

    private final Path storageRoot = Paths.get("storage");

    public String storeFile(MultipartFile file, String category, String userId) {
        try {
            Path dir = storageRoot.resolve(category).resolve(userId.toString());
            Files.createDirectories(dir);

            String filename = StringUtils.cleanPath(file.getOriginalFilename());
            Path targetPath = dir.resolve(filename);
            file.transferTo(targetPath.toFile());

            log.info("Stored file: {} in {}", filename, targetPath.toAbsolutePath());
            return targetPath.toString();
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new FileProcessingException("Failed to store file");
        }
    }


    private String getExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return idx > 0 ? filename.substring(idx) : "";
    }

    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return; // nothing to delete
        }

        Path path = Paths.get(filePath);
        try {
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Deleted file: {}", path.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Failed to delete file: {}", path.toAbsolutePath(), e);
            throw new FileProcessingException("Failed to delete file");
        }
    }

    public void processFile(MultipartFile file, String category, UUID userId, String currentPath, Consumer<String> pathSetter) {
        if (file != null && !file.isEmpty()) {
            if (currentPath != null) {
                deleteFile(currentPath);
            }

            String newPath = storeFile(file, category, userId.toString());
            pathSetter.accept(newPath);
        }
    }


}
