package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.service.AudioFileProcessor;
import com.mpatric.mp3agic.Mp3File;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sound.sampled.*;
import java.io.File;
import java.io.IOException;

@Slf4j
@Service
public class AudioFileProcessorImpl implements AudioFileProcessor {

    @Override
    public Integer getDuration(File file) {
        String fileName = file.getName().toLowerCase();

        if (fileName.endsWith(".mp3")) {
            return getMp3Duration(file);
        } else if (fileName.endsWith(".wav")) {
            return getWavDuration(file);
        } else {
            throw new IllegalArgumentException("Unsupported audio format: " + fileName);
        }
    }

    private Integer getMp3Duration(File file) {
        try {
            Mp3File mp3File = new Mp3File(file);
            return (int) mp3File.getLengthInSeconds();
        } catch (Exception e) {
            log.error("Failed to get MP3 duration for file: {}", file.getName(), e);
            throw new RuntimeException("Failed to get MP3 duration", e);
        }
    }

    private Integer getWavDuration(File file) {
        try (AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(file)) {
            AudioFormat format = audioInputStream.getFormat();
            long frames = audioInputStream.getFrameLength();
            double durationInSeconds = (frames + 0.0) / format.getFrameRate();
            return (int) Math.round(durationInSeconds);
        } catch (UnsupportedAudioFileException | IOException e) {
            log.error("Failed to get WAV duration for file: {}", file.getName(), e);
            throw new RuntimeException("Failed to get WAV duration", e);
        }
    }
}
