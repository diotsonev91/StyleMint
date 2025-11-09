package bg.softuni.stylemint.product.audio.service.utils;

import lombok.experimental.UtilityClass;

@UtilityClass
public class FileSizeUtils {

    public static long parseFileSize(String size) {
        if (size == null || size.equals("Calculating...") || size.equals("Recalculated")) {
            return 0L;
        }

        if (size.endsWith(" KB")) {
            double kb = Double.parseDouble(size.replace(" KB", ""));
            return (long) (kb * 1024);
        } else if (size.endsWith(" MB")) {
            double mb = Double.parseDouble(size.replace(" MB", ""));
            return (long) (mb * 1024 * 1024);
        } else if (size.endsWith(" GB")) {
            double gb = Double.parseDouble(size.replace(" GB", ""));
            return (long) (gb * 1024 * 1024 * 1024);
        }
        return 0L;
    }

    public static String formatFileSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.2f KB", bytes / 1024.0);
        } else if (bytes < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
        } else {
            return String.format("%.2f GB", bytes / (1024.0 * 1024.0 * 1024.0));
        }
    }
}