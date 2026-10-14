import React from 'react';

export const NoData = ({ label = 'No records available.' }) => {
  return (
    <div className="py-4 text-center text-muted-custom fst-italic fs-7">
      {label}
    </div>
  );
};
