package bg.softuni.stylemint.product.audio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SamplePackDetailDTO {
    private SamplePackDTO pack;
    private List<AudioSampleDTO> samples;
}