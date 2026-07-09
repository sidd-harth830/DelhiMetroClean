import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LineStatusCarousel } from '../components/LineStatusCarousel';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

export function NotificationsScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LineStatusCarousel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
