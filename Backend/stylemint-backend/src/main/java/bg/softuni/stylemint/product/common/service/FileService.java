package bg.softuni.stylemint.product.common.service;

import bg.softuni.stylemint.common.exception.FileProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.storage.base-path:uploads}")
    private String basePath;  // Използваме настройката от properties

    public String storeFile(MultipartFile file, String category, String userId) {
        try {
            // Път за директорията, която ще съдържа файловете на потребителя
            Path dir = Paths.get(basePath).resolve(category).resolve(userId.toString());

            // Създаване на всички липсващи директории
            Files.createDirectories(dir);

            // Лог за директорията
            log.info("Storing file in directory: {}", dir.toAbsolutePath());

            // Получаваме името на файла и го чистим от невалидни символи
            String filename = StringUtils.cleanPath(file.getOriginalFilename());
            log.info("Filename: {}", filename);

            // Път към целевия файл
            Path targetPath = dir.resolve(filename);

            // Прехвърляне на файла в целевата директория
            file.transferTo(targetPath.toFile());

            // Лог за успешното съхранение
            log.info("Stored file: {} in {}", filename, targetPath.toAbsolutePath());

            // Връщаме пълния път до файла
            return targetPath.toString();
        } catch (IOException e) {
            // Логваме грешката и хвърляме специфичната грешка
            log.error("Error occurred while storing file: {}", e.getMessage(), e);
            throw new FileProcessingException("Failed to store file");
        }
    }


    // Метод за обработка на файла - съхранява го, ако има нов
    public void processFile(MultipartFile file, String category, UUID userId, String currentPath, Consumer<String> pathSetter) {
        if (file != null && !file.isEmpty()) {
            if (currentPath != null) {
                // Изтриваме стария файл и го заменяме с нов
                deleteFile(currentPath);
            }

            String newPath = storeFile(file, category, userId.toString());
            pathSetter.accept(newPath);
        }
    }


    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return; // Няма какво да се изтрие
        }

        Path path = Paths.get(basePath);

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
}
