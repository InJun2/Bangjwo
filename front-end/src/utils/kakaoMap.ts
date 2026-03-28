export const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      return resolve();
    }

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(resolve);
      return;
    }

    const isScriptExist = document.querySelector(
      'script[src^="https://dapi.kakao.com/v2/maps/sdk.js"]'
    );
    if (isScriptExist) {
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false&libraries=services`;
    script.onload = () => window.kakao.maps.load(resolve);
    script.onerror = () => reject("Failed to load kakao map API script");

    document.head.appendChild(script);
  });
};

export const removeKakaoMapScript = () => {
  const script = document.querySelector(
    'script[src^="https://dapi.kakao.com/v2/maps/sdk.js"]'
  );
  if (script) {
    document.head.removeChild(script);
  }
};

interface GeocoderResult {
  x: string;
  y: string;
  address_name: string;
}

export const getLatLngFromAddress = (
  address: string
): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    const { kakao } = window;

    if (!kakao || !kakao.maps || !kakao.maps.services) {
      return reject("Kakao map API is not loaded.");
    }

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(
      address,
      (result: GeocoderResult[], status: string) => {
        if (status === kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          resolve({ lat, lng });
        } else {
          reject("Failed to get lat and lng from address");
        }
      }
    );
  });
};

interface KeywordSearchResult {
  y: string;
  x: string;
  place_name: string;
}

interface KeywordSearchResult {
  y: string;
  x: string;
  place_name: string;
}

export const getLatLngFromKeyword = (
  keyword: string
): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    const { kakao } = window;

    if (!kakao || !kakao.maps || !kakao.maps.services) {
      reject("Kakao map API is not loaded.");
      return;
    }

    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data: KeywordSearchResult[], status: string) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        const lat = parseFloat(data[0].y);
        const lng = parseFloat(data[0].x);
        resolve({ lat, lng });
      } else {
        reject("Failed to get lat and lng from keyword");
      }
    });
  });
};
