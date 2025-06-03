import React from 'react';
import './ThumbnailGallery.css';

const sampleImages = [
  { id: 'yujin_v1', url: '/images/yujin1.jpg', name: '안유진 ver.1' },
  { id: 'gaeul_v2', url: '/images/gaeul2.jpg', name: '가을 ver.2' },
  { id: 'wonyoung_v1', url: '/images/wonyoung1.jpg', name: '장원영 ver.1' }
];

const ThumbnailGallery = ({ onSelectImage }: { onSelectImage: (url: string) => void }) => {
  return (
    <div className="thumbnail-gallery">
      {sampleImages.map((img) => (
        <div
          key={img.id}
          className="thumbnail"
          onClick={() => onSelectImage(img.url)}
          title={img.name}
        >
          <img src={img.url} alt={img.name} />
        </div>
      ))}
    </div>
  );
};

export default ThumbnailGallery;
