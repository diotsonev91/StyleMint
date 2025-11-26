package bg.softuni.stylemint.product.audio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ZipResult {
    private String fileName;
    private byte[] bytes;
}