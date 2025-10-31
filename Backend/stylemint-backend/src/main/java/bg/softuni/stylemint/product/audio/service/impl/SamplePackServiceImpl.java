package bg.softuni.stylemint.product.audio.service.impl;

import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.product.audio.service.SamplePackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SamplePackServiceImpl implements SamplePackService {

    private final SamplePackRepository samplePackRepository;

    @Override
    public long countPacksByAuthor(UUID authorId) {
        return samplePackRepository.countByAuthorId(authorId);
    }
}
