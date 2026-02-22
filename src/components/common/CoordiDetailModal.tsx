import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClothItem from './ClothItem';
import api from '../../api/axios'; // 💡 똑똑한 api 인스턴스 가져오기!

interface CoordiClothData {
  slot: string;
  clothId: number;
  imageUrl: string;
  category: string;
  subCategory?: string; 
  color?: string;       
  season: string;
  isRaining: boolean;
}

export interface CoordiData {
  presetId: string | number; 
  name: string; 
  items: CoordiClothData[]; 
}

interface CoordiDetailModalProps {
  data: CoordiData;
  onClose: () => void;
  onRefresh: () => void;
}

const CoordiDetailModal = ({ data, onClose, onRefresh }: CoordiDetailModalProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState(data.name);

  // 💡 수정 1: items가 없을 때를 대비한 안전장치(?) 추가 -> 화면 크래시 방지!
  const getItemBySlot = (slot: string) => data.items?.find(item => item.slot === slot);
 
  const handleDelete = async () => {
    if (!window.confirm("정말 이 코디를 삭제할까요?")) return;
    
    // 💡 수정 2: presetId가 정상적으로 있는지 한번 더 체크 (presetsun 에러 방지)
    if (!data.presetId) {
      alert("삭제할 코디의 ID를 찾을 수 없습니다.");
      return;
    }

    try {
      // 💡 수정 3: 엉뚱한 IP와 fetch 대신, 완벽하게 세팅된 api 인스턴스 사용!
      const response = await api.delete(`/api/presets/${data.presetId}`);

      // axios는 기본적으로 2xx 상태 코드를 성공으로 간주하므로 ok 대신 status 체크
      if (response.status === 200 || response.status === 204) {
        alert("코디가 성공적으로 삭제되었습니다.");
        onRefresh(); // 리스트 새로고침
        onClose();   // 모달 닫기
      }
    } catch (e) {
      console.error("삭제 에러:", e);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100]">
      <div className="w-[90%] max-w-[400px] bg-white rounded-[20px] p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lg">코디 정보</h4>
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </div>

        {/* 2*2 이미지 배치 UI */}
        <div className="grid grid-cols-2 gap-1 aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4 border border-gray-200">
          {['TOP', 'BOTTOM', 'DRESS', 'OUTER'].map(slot => {
              const item = getItemBySlot(slot); 
              return (
                <div key={slot} className="bg-white">
                  {item ? (
                    <ClothItem item={item} />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-300">
                      EMPTY
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-sm font-semibold text-gray-600">코디 이름</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none"
            readOnly // 모달에서는 이름만 보여주고 수정은 수정 페이지에서 하도록 권장
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleDelete} className="flex-1 p-3.5 text-red-500 border border-red-200 rounded-2xl font-bold hover:bg-red-50 transition-colors">
            삭제하기
          </button>
          <button 
            onClick={() => navigate(`/coordi/save?edit=${data.presetId}`)} 
            className="flex-[1.5] p-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-md"
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoordiDetailModal;