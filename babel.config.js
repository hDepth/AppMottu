module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // Make sure this is the last plugin in the array
    'react-native-worklets/plugin', 
  ],
};