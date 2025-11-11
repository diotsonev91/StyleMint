import { useLocation, useParams } from 'react-router-dom';
import PackForm from '../../components/forms/PackForm';

const EditPackPage = () => {
  const { packId } = useParams();
  const location = useLocation();
  const { pack } = location.state || {}; // pack passed from PackInfo

  const initialData = pack ? {
    packTitle: pack.title,
    artist: pack.artist,
    price: pack.price,
    description: pack.description,
    selectedGenres: pack.genres,
    tags: pack.tags,
    coverPreview: pack.coverImage,
    samples: pack.samples?.map(sample => ({
      id: `existing-${sample.id}`,
      name: sample.name,
      artist: sample.artist,
      bpm: sample.bpm,
      duration: sample.duration,
      musicalKey: sample.key,
      musicalScale: sample.scale,
      genre: sample.genre,
      sampleType: sample.sampleType,
      instrumentGroup: sample.instrumentGroup,
      audioUrl: sample.audioUrl,
      isExisting: true,
      existingSampleId: sample.id
    })) || []
  } : undefined;

  return (
    <PackForm
      mode="edit"
      packId={packId}
      initialData={initialData}
    />
  );
};

export default EditPackPage;
