import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SampleForm, { SampleFormData } from '../../components/forms/SampleForm';
import ConfirmationModal from './confirmationModal/ConfirmationModal';
import { audioSampleService } from '../../services/audioSampleService';
import { audioPackService } from '../../services/audioPackService';


interface PackInfo {
  id: string;
  name: string;
}

const EditSamplePage: React.FC = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const [initialData, setInitialData] = useState<Partial<SampleFormData>>({});
  const [packInfo, setPackInfo] = useState<PackInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnbinding, setIsUnbinding] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSampleData = async () => {
      if (sampleId) {
        setIsLoading(true);
        try {
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
            
            // Check if sample is part of a pack and fetch pack info
            if (sample.packId) {
              const packResponse = await audioPackService.getPackById(sample.packId);
              if (packResponse.success && packResponse.data) {
                console.log(packResponse.data)
                setPackInfo({
                  id: sample.packId,
                  name: packResponse.data.title
                });
              }
            }
          } else {
            console.error('Failed to load sample:', response.error);
          }
        } catch (error) {
          console.error('Error fetching sample data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSampleData();
  }, [sampleId]);

  const handleSubmit = async (data: SampleFormData) => {
    console.log("calling update");

    const response = await audioSampleService.updateSampleMetadata(sampleId!, data);

    if (response.success) {
      navigate('/my-samples');
    } else {
      console.error('Failed to update sample:', response.error);
    }
  };

  const handleUnbindClick = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmUnbind = async () => {
    if (!packInfo || !sampleId) return;

    setIsUnbinding(true);
    try {
      const response = await audioSampleService.unboundSampleFromPack(packInfo.id, sampleId);
      
      if (response.success) {
        setPackInfo(null);
        setShowConfirmationModal(false);
        
        // Refetch sample data to ensure consistency
        const sampleResponse = await audioSampleService.getSampleById(sampleId);
        if (sampleResponse.success && sampleResponse.data) {
          const sample = sampleResponse.data;
          setInitialData(prev => ({
            ...prev,
            // Update any other fields if needed
          }));
        }
        
        console.log('Sample successfully unbound from pack');
      } else {
        console.error('Failed to unbind sample from pack:', response.error);
      }
    } catch (error) {
      console.error('Error unbinding sample from pack:', error);
    } finally {
      setIsUnbinding(false);
    }
  };

  const handleCancelUnbind = () => {
    setShowConfirmationModal(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {packInfo && (
        <>
         <h3 style={{ 
          marginBottom: '20px', 
          width:'25rem',
          margin: 'auto',
          padding: '15px', 
          fontSize: '32px'
        }}>THIS SAMPLE IS PART OF </h3>
        <div style={{ 
          marginBottom: '20px', 
          width:'24rem',
          margin: 'auto',
          padding: '15px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
            <h1><strong>{packInfo.name}</strong> </h1>
            <button
            onClick={handleUnbindClick}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '4rem',
            }}
          >
            Unbind from Pack
          </button>
          </div>
        <div >
          
        </div>
        </>
      )}
      
      <ConfirmationModal
        isOpen={showConfirmationModal}
        title="Confirm Unbind from Pack"
        message={`This sample will not be part of "${packInfo?.name}" anymore. Are you sure you want to continue?`}
        confirmText="Yes, Unbind"
        cancelText="Cancel"
        onConfirm={handleConfirmUnbind}
        onCancel={handleCancelUnbind}
        isProcessing={isUnbinding}
        variant="danger"
      />
      
      <SampleForm 
        mode="edit"
        sampleId={sampleId}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditSamplePage;