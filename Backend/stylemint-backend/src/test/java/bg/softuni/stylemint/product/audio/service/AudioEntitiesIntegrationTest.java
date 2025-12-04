package bg.softuni.stylemint.product.audio.service;

import bg.softuni.stylemint.product.audio.enums.*;
import bg.softuni.stylemint.product.audio.model.*;
import bg.softuni.stylemint.product.audio.repository.*;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("tests")
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AudioEntitiesIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AudioSampleRepository audioSampleRepository;

    @Autowired
    private SamplePackRepository samplePackRepository;

    @Autowired
    private SampleLicenseRepository sampleLicenseRepository;

    @Autowired
    private PackLicenseRepository packLicenseRepository;

    @Autowired
    private SampleLikeRepository sampleLikeRepository;

    @Autowired
    private PackRatingRepository packRatingRepository;

    @Test
    void testSamplePackAndAudioSampleRelationship() {
        // Arrange
        UUID authorId = UUID.randomUUID();

        // Create SamplePack first - Hibernate will create tables automatically
        SamplePack pack = SamplePack.builder()
                .title("Test Pack")
                .authorId(authorId)
                .artist("Test Artist")
                .coverImage("cover.jpg")
                .price(49.99)
                .sampleCount(2)
                .totalSize("200 MB")
                .description("Test Description")
                .genres(List.of(Genre.HIP_HOP))
                .tags(List.of("test"))
                .salesCount(0L)
                .build();

        SamplePack savedPack = samplePackRepository.save(pack);

        // Create AudioSample linked to pack
        AudioSample sample = AudioSample.builder()
                .name("Test Sample")
                .authorId(authorId)
                .artist("Test Artist")
                .audioUrl("audio.mp3")
                .price(4.99)
                .sampleType(SampleType.ONESHOT)
                .pack(savedPack)
                .salesCount(0L)
                .build();

        AudioSample savedSample = audioSampleRepository.save(sample);

        // Assert
        assertThat(savedPack.getId()).isNotNull();
        assertThat(savedSample.getId()).isNotNull();
        assertThat(savedSample.getPack().getId()).isEqualTo(savedPack.getId());

        // Verify relationship
        List<AudioSample> packSamples = audioSampleRepository.findByPackAndArchivedFalse(savedPack);
        assertThat(packSamples).hasSize(1);
        assertThat(packSamples.get(0).getId()).isEqualTo(savedSample.getId());
    }

    @Test
    void testUserAndLicenses() {
        // Arrange
        User user = User.builder()
                .email("license@test.com")
                .password("password")
                .displayName("User")
                .build();
        User savedUser = userRepository.save(user);

        UUID authorId = UUID.randomUUID();

        SamplePack pack = SamplePack.builder()
                .title("License Pack")
                .authorId(authorId)
                .artist("Artist")
                .coverImage("cover.jpg")
                .price(49.99)
                .sampleCount(1)
                .totalSize("100 MB")
                .description("Desc")
                .salesCount(0L)
                .build();
        SamplePack savedPack = samplePackRepository.save(pack);

        AudioSample sample = AudioSample.builder()
                .name("License Sample")
                .authorId(authorId)
                .artist("Artist")
                .audioUrl("audio.mp3")
                .price(4.99)
                .sampleType(SampleType.ONESHOT)
                .pack(savedPack)
                .salesCount(0L)
                .build();
        AudioSample savedSample = audioSampleRepository.save(sample);

        // Act - Create licenses
        SampleLicense sampleLicense = SampleLicense.builder()
                .user(savedUser)
                .audioSample(savedSample)
                .orderItemId(UUID.randomUUID())
                .purchasedAt(OffsetDateTime.now())
                .archived(false)
                .build();
        sampleLicenseRepository.save(sampleLicense);

        PackLicense packLicense = PackLicense.builder()
                .user(savedUser)
                .packId(savedPack.getId())
                .orderItemId(UUID.randomUUID())
                .purchasedAt(OffsetDateTime.now())
                .archived(false)
                .build();
        packLicenseRepository.save(packLicense);

        // Assert
        assertThat(sampleLicenseRepository.count()).isEqualTo(1);
        assertThat(packLicenseRepository.count()).isEqualTo(1);

        boolean hasLicense = sampleLicenseRepository
                .existsByUserIdAndAudioSampleId(savedUser.getId(), savedSample.getId());
        assertThat(hasLicense).isTrue();
    }

    @Test
    void testLikesAndRatings() {
        // Arrange
        User user = User.builder()
                .email("like@test.com")
                .password("password")
                .displayName("User")
                .build();
        User savedUser = userRepository.save(user);

        UUID authorId = UUID.randomUUID();

        SamplePack pack = SamplePack.builder()
                .title("Rating Pack")
                .authorId(authorId)
                .artist("Artist")
                .coverImage("cover.jpg")
                .price(49.99)
                .sampleCount(1)
                .totalSize("100 MB")
                .description("Desc")
                .salesCount(0L)
                .build();
        SamplePack savedPack = samplePackRepository.save(pack);

        AudioSample sample = AudioSample.builder()
                .name("Liked Sample")
                .authorId(authorId)
                .artist("Artist")
                .audioUrl("audio.mp3")
                .price(4.99)
                .sampleType(SampleType.ONESHOT)
                .pack(savedPack)
                .salesCount(0L)
                .build();
        AudioSample savedSample = audioSampleRepository.save(sample);

        // Act - Create like
        SampleLike like = SampleLike.builder()
                .user(savedUser)
                .audioSample(savedSample)
                .build();
        sampleLikeRepository.save(like);

        // Act - Create rating
        PackRating rating = PackRating.builder()
                .samplePack(savedPack)
                .userId(savedUser.getId())
                .rating(4.5)
                .build();
        packRatingRepository.save(rating);

        // Assert
        long likeCount = sampleLikeRepository.countByAudioSampleId(savedSample.getId());
        assertThat(likeCount).isEqualTo(1);

        var userRating = packRatingRepository
                .findBySamplePackAndUserId(savedPack, savedUser.getId());
        assertThat(userRating).isPresent();
        assertThat(userRating.get().getRating()).isEqualTo(4.5);
    }
}