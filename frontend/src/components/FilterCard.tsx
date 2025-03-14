import _React, { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';

type Props = {}

export const FilterCard = (_props: Props) => {
  const [deliveryTime, setDeliveryTime] = useState([15]);
  const [budget, setBudget] = useState([500]);

  const handleFilter = () => {
    // Implement filter logic
    console.log({
      deliveryTime,
      budget
    });
  };

  return (
    <div className="flex flex-col items-center justify-center bg-grey p-4 rounded-lg shadow-md w-full">
  <div className="mb-4 w-full">
    <h2 className="text-xl font-semibold mb-3">Delivery time (days)</h2>
    <Slider.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      value={deliveryTime}
      onValueChange={setDeliveryTime}
      max={30}
      min={1}
      step={1}
    >
      <Slider.Track className="bg-white relative grow rounded-full h-2 w-full">
        <Slider.Range className="absolute bg-secondary-500 rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-4 h-4 bg-secondary-500 rounded-full hover:w-5 hover:h-5 focus:outline-none"
      />
    </Slider.Root>
    <div className="flex justify-between mt-1 text-sm text-gray-600 w-full">
      <span>1</span>
      {deliveryTime[0] > 29 ? <span>{deliveryTime}+</span> : <span>{deliveryTime}</span>}
    </div>
  </div>

  <div className="mb-8 w-full">
    <h2 className="text-xl font-semibold mb-3">Budget</h2>
    <Slider.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      value={budget}
      onValueChange={setBudget}
      max={999}
      min={5}
      step={5}
    >
      <Slider.Track className="bg-white relative grow rounded-full h-2 w-full">
        <Slider.Range className="absolute bg-secondary-500 rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-4 h-4 bg-secondary-500 rounded-full hover:w-5 hover:h-5 focus:outline-none"
      />
    </Slider.Root>
    <div className="flex justify-between mt-1 text-sm text-gray-600 w-full">
      <span>$5</span>
      {budget[0] > 995 ? <span>${budget}+</span> : <span>${budget}</span>}
    </div>
  </div>

  <button
    onClick={handleFilter}
    className="mx-auto px-12 bg-secondary-500 text-white py-2 rounded-lg hover:bg-secondary-600 transition"
  >
    Filter
  </button>    
</div>
  );
}