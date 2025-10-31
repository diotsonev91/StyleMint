package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AudioSampleServiceImpl implements AudioSampleService {

    private final AudioSampleRepository audioSampleRepository;

    @Override
    public long countSamplesByAuthor(UUID authorId) {
        return audioSampleRepository.countByAuthorId(authorId);
    }
}
