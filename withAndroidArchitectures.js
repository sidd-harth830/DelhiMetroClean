const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAndroidArchitectures(config) {
  return withGradleProperties(config, (config) => {
    // Find the existing property if it exists
    const architecturesPropIndex = config.modResults.findIndex(
      (prop) => prop.type === 'property' && prop.key === 'reactNativeArchitectures'
    );

    const targetArchitectures = 'armeabi-v7a,arm64-v8a';

    if (architecturesPropIndex !== -1) {
      // Modify existing property
      config.modResults[architecturesPropIndex].value = targetArchitectures;
    } else {
      // Add new property
      config.modResults.push({
        type: 'property',
        key: 'reactNativeArchitectures',
        value: targetArchitectures,
      });
    }

    return config;
  });
};
