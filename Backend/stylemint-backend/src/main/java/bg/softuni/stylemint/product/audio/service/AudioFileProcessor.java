package bg.softuni.stylemint.product.audio.service;

import java.io.File;

public interface AudioFileProcessor {
    Integer getDuration(File file);
}