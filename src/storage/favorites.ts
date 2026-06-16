import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteStation {
  code: string;
  name: string;
}

export interface SavedRoute {
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
}

const FAVORITE_STATIONS_KEY = '@favorite_stations';
const SAVED_ROUTES_KEY = '@saved_routes';

export const FavoritesStorage = {
  getFavoriteStations: async (): Promise<FavoriteStation[]> => {
    try {
      const data = await AsyncStorage.getItem(FAVORITE_STATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  addFavoriteStation: async (station: FavoriteStation): Promise<void> => {
    try {
      const stations = await FavoritesStorage.getFavoriteStations();
      if (!stations.some((s) => s.code === station.code)) {
        await AsyncStorage.setItem(FAVORITE_STATIONS_KEY, JSON.stringify([station, ...stations]));
      }
    } catch {}
  },
  
  removeFavoriteStation: async (code: string): Promise<void> => {
    try {
      const stations = await FavoritesStorage.getFavoriteStations();
      const filtered = stations.filter((s) => s.code !== code);
      await AsyncStorage.setItem(FAVORITE_STATIONS_KEY, JSON.stringify(filtered));
    } catch {}
  },
  
  isFavoriteStation: async (code: string): Promise<boolean> => {
    try {
      const stations = await FavoritesStorage.getFavoriteStations();
      return stations.some((s) => s.code === code);
    } catch {
      return false;
    }
  },

  getSavedRoutes: async (): Promise<SavedRoute[]> => {
    try {
      const data = await AsyncStorage.getItem(SAVED_ROUTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addSavedRoute: async (route: SavedRoute): Promise<void> => {
    try {
      const routes = await FavoritesStorage.getSavedRoutes();
      const isSaved = routes.some(
        (r) => r.fromCode === route.fromCode && r.toCode === route.toCode
      );
      if (!isSaved) {
        await AsyncStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify([route, ...routes]));
      }
    } catch {}
  },

  removeSavedRoute: async (fromCode: string, toCode: string): Promise<void> => {
    try {
      const routes = await FavoritesStorage.getSavedRoutes();
      const filtered = routes.filter(
        (r) => !(r.fromCode === fromCode && r.toCode === toCode)
      );
      await AsyncStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(filtered));
    } catch {}
  },
  
  isSavedRoute: async (fromCode: string, toCode: string): Promise<boolean> => {
    try {
      const routes = await FavoritesStorage.getSavedRoutes();
      return routes.some(
        (r) => r.fromCode === fromCode && r.toCode === toCode
      );
    } catch {
      return false;
    }
  }
};
