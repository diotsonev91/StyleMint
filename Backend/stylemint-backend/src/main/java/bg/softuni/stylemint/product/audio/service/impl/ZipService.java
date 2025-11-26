package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.dto.SamplePackDetailDTO;

import bg.softuni.stylemint.product.audio.dto.ZipResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Slf4j
@Service
public class ZipService {

    public ZipResult createPackZip(SamplePackDetailDTO packDetail) throws Exception {

        String packName = sanitizeFileName(packDetail.getPack().getTitle());
        List<AudioSampleDTO> samples = packDetail.getSamples();

        if (samples.isEmpty()) {
            throw new IllegalStateException("Pack contains no samples.");
        }

        log.info("📦 Creating ZIP for pack: {} with {} samples", packName, samples.size());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zos = new ZipOutputStream(baos)) {

            for (int i = 0; i < samples.size(); i++) {
                AudioSampleDTO sample = samples.get(i);

                try {
                    log.info("⬇️ Adding to ZIP ({}/{}): {}", i + 1, samples.size(), sample.getName());

                    URL url = new URL(sample.getAudioUrl());

                    try (InputStream inputStream = url.openStream()) {

                        String fileName = sanitizeFileName(sample.getName()) + ".mp3";

                        zos.putNextEntry(new ZipEntry(fileName));

                        byte[] buffer = new byte[8192];
                        int bytesRead;

                        while ((bytesRead = inputStream.read(buffer)) != -1) {
                            zos.write(buffer, 0, bytesRead);
                        }

                        zos.closeEntry();
                        log.info("✅ Added to ZIP: {}", fileName);

                    }

                } catch (Exception ex) {
                    log.error("❌ Failed adding {}: {}", sample.getName(), ex.getMessage());
                }
            }

            zos.finish();
        }

        byte[] zipBytes = baos.toByteArray();
        String zipFileName = packName + ".zip";

        log.info("✅ ZIP created: {} ({} bytes)", zipFileName, zipBytes.length);

        return new ZipResult(zipFileName, zipBytes);
    }

    private String sanitizeFileName(String name) {
        return name
                .replaceAll("[^a-zA-Z0-9-_\\s]", "")
                .replaceAll("\\s+", "_")
                .trim();
    }
}