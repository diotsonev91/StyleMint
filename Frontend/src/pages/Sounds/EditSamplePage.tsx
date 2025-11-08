// src/pages/EditSamplePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SampleForm, { SampleFormData } from '../../components/forms/SampleForm';
import { audioSampleService } from '../../services/audioSampleService';


const EditSamplePage: React.FC = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const [initialData, setInitialData] = useState<Partial<SampleFormData>>({});
    const navigate = useNavigate(); 

 useEffect(() => {
  const fetchSampleData = async () => {
    if (sampleId) {
      const response = await audioSampleService.getSampleById(sampleId);

      if (response.success && response.data) {
        const sample = response.data;

        setInitialData({
          name: sample.name,
          artist: sample.artist,
          price: sample.price.toString(),
          bpm: sample.bpm,
          musicalKey: sample.key,
          musicalScale: sample.scale,
          genre: sample.genre,
          sampleType: sample.sampleType,
          instrumentGroup: sample.instrumentGroup,
          tags: sample.tags || [],
        });
      } else {
        console.error('Failed to load sample:', response.error);
      }
    }
  };

  fetchSampleData();
}, [sampleId]);


  const handleSubmit = async (data: SampleFormData) => {
    console.log("calling update");

    const response = await audioSampleService.updateSampleMetadata(sampleId!, data);

    if (response.success) {
      // Redirect to /my-samples after successful update
      navigate('/my-samples');
    } else {
      console.error('Failed to update sample:', response.error);
      // optionally show a toast or alert
    }
  };

  return (
    <SampleForm 
      mode="edit"
      sampleId={sampleId}
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
};

export default EditSamplePage;