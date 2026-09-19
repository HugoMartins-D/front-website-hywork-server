// src/components/DualRangeSlider.tsx
'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { toPersianNumber } from '@/utils/numberUtils';


interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  isSmallMobile?: boolean;
}



const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1000,
  isSmallMobile = false,
}) => {


  const sliderRef = useRef<HTMLDivElement>(null);


  const [dragging, setDragging] =
    useState<'min' | 'max' | null>(null);



  const [minVal, setMinVal] =
    useState(value[0]);


  const [maxVal, setMaxVal] =
    useState(value[1]);



  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);



  const valueMin = value[0];
  const valueMax = value[1];



  // ===============================
  // Sync parent value
  // ===============================

  useEffect(() => {


    if (dragging !== null)
      return;



    if (minValRef.current !== valueMin) {

      minValRef.current = valueMin;

      setMinVal(valueMin);
    }



    if (maxValRef.current !== valueMax) {

      maxValRef.current = valueMax;

      setMaxVal(valueMax);
    }



  }, [
    valueMin,
    valueMax,
    dragging
  ]);





  // ===============================
  // Format
  // ===============================

  const formatNumber = useCallback(
    (num:number)=>{


      if(num >= 1_000_000_000){

        return (
          toPersianNumber(
            (num / 1_000_000_000)
            .toFixed(1)
          )
          + ' میلیارد'
        );

      }



      if(num >= 1_000_000){

        return (
          toPersianNumber(
            (num / 1_000_000)
            .toFixed(1)
          )
          + ' م'
        );

      }




      if(num >= 1_000){

        return (
          toPersianNumber(
            (num / 1_000)
            .toFixed(0)
          )
          + ' هزار'
        );

      }



      return toPersianNumber(
        num.toString()
      );


    },
    []
  );





  // ===============================
  // Mouse position to value
  // ===============================

  const getValueFromX = useCallback(
    (clientX:number)=>{


      if(!sliderRef.current)
        return min;



      const rect =
        sliderRef.current
        .getBoundingClientRect();



      let percent =
        (clientX - rect.left)
        /
        rect.width;



      percent =
        Math.max(
          0,
          Math.min(1, percent)
        );



      // RTL
      percent = 1 - percent;



      let result =
        min +
        percent *
        (max-min);



      result =
        Math.round(result / step)
        *
        step;



      return Math.max(
        min,
        Math.min(max,result)
      );


    },
    [
      min,
      max,
      step
    ]
  );





  // ===============================
  // Move
  // ===============================

  const handleMove = useCallback(
    (clientX:number)=>{


      if(!dragging)
        return;



      const newValue =
        getValueFromX(clientX);



      if(dragging === 'min'){


        const newMin =
          Math.min(
            newValue,
            maxValRef.current - step
          );



        if(
          newMin !== minValRef.current
        ){

          minValRef.current =
            newMin;


          setMinVal(newMin);



          onChange([
            newMin,
            maxValRef.current
          ]);

        }


      }




      if(dragging === 'max'){



        const newMax =
          Math.max(
            newValue,
            minValRef.current + step
          );



        if(
          newMax !== maxValRef.current
        ){


          maxValRef.current =
            newMax;


          setMaxVal(newMax);



          onChange([
            minValRef.current,
            newMax
          ]);


        }

      }



    },
    [
      dragging,
      getValueFromX,
      step,
      onChange
    ]
  );






  // ===============================
  // Events
  // ===============================


  const handleMouseMove =
    useCallback(
      (e:MouseEvent)=>{

        handleMove(
          e.clientX
        );

      },
      [
        handleMove
      ]
    );



  const handleTouchMove =
    useCallback(
      (e:TouchEvent)=>{


        if(e.touches.length){

          handleMove(
            e.touches[0].clientX
          );

        }


      },
      [
        handleMove
      ]
    );



  const handleEnd =
    useCallback(()=>{

      setDragging(null);

    },[]);





  useEffect(()=>{


    if(!dragging)
      return;



    window.addEventListener(
      'mousemove',
      handleMouseMove
    );


    window.addEventListener(
      'mouseup',
      handleEnd
    );


    window.addEventListener(
      'touchmove',
      handleTouchMove,
      {
        passive:false
      }
    );


    window.addEventListener(
      'touchend',
      handleEnd
    );




    return()=>{


      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );


      window.removeEventListener(
        'mouseup',
        handleEnd
      );


      window.removeEventListener(
        'touchmove',
        handleTouchMove
      );


      window.removeEventListener(
        'touchend',
        handleEnd
      );


    };


  },[
    dragging,
    handleMouseMove,
    handleTouchMove,
    handleEnd
  ]);






  // ===============================
  // Start drag
  // ===============================

  const handleDragStart =
    useCallback(
      (
        type:'min'|'max'
      ) =>
      (
        e:
        React.MouseEvent |
        React.TouchEvent
      )=>{


        e.preventDefault();

        e.stopPropagation();


        setDragging(type);


      },
      []
    );







  // ===============================
  // Positions
  // ===============================

  const minPercent =
    ((minVal-min)/(max-min))*100;



  const maxPercent =
    ((maxVal-min)/(max-min))*100;



  const visualMinLeft =
    100 - minPercent;



  const visualMaxLeft =
    100 - maxPercent;



  const activeLeft =
    Math.min(
      visualMinLeft,
      visualMaxLeft
    );



  const activeWidth =
    Math.abs(
      visualMinLeft -
      visualMaxLeft
    );






  const tooltipClasses = `
    absolute bottom-7 left-1/2
    -translate-x-1/2
    bg-gray-800 text-white
    rounded-md
    ${
      isSmallMobile
      ?
      'px-1.5 py-0.5 text-[9px]'
      :
      'px-2 py-1 text-[11px] whitespace-nowrap'
    }
    pointer-events-none
    z-10
  `;





  // ===============================
  // Single value mode
  // ===============================

  if(min === max){

    return (

      <div className="
        h-10
        flex
        items-center
        justify-center
        text-xs
        text-text-muted
      ">
        محدوده قیمت تکی
      </div>

    );

  }






  return (

    <div
      ref={sliderRef}
      className="
        relative
        w-full
        h-10
        touch-none
      "
      style={{
        direction:'ltr'
      }}
    >



      <div
        className="
          absolute
          top-4.5
          left-0
          right-0
          h-1
          bg-border-color
          rounded-full
        "
      />




      <div
        className="
          absolute
          top-4.5
          h-1
          bg-white
          rounded-full
        "
        style={{
          left:`${activeLeft}%`,
          width:`${activeWidth}%`
        }}
      />






      {/* MAX */}

      <div
        className="
          absolute
          top-2.25
          w-5
          h-5
          bg-white
          rounded-full
          border-2
          border-gray-300
          cursor-ew-resize
          shadow-sm
          z-10
        "
        style={{
          left:`${visualMaxLeft}%`,
          transform:
          'translateX(-50%)'
        }}

        onMouseDown={
          handleDragStart('max')
        }

        onTouchStart={
          handleDragStart('max')
        }
      >

        <div className={tooltipClasses}>
          تا {formatNumber(maxVal)} تومان
        </div>

      </div>





      {/* MIN */}

      <div
        className="
          absolute
          top-2.25
          w-5
          h-5
          bg-white
          rounded-full
          border-2
          border-gray-300
          cursor-ew-resize
          shadow-sm
          z-10
        "
        style={{
          left:`${visualMinLeft}%`,
          transform:
          'translateX(-50%)'
        }}

        onMouseDown={
          handleDragStart('min')
        }

        onTouchStart={
          handleDragStart('min')
        }
      >

        <div className={tooltipClasses}>
          از {formatNumber(minVal)} تومان
        </div>

      </div>



    </div>

  );

};


export default DualRangeSlider;