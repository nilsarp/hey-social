import EnvironmentPlugin from 'vite-plugin-environment';

export default {
  plugins: [
    EnvironmentPlugin({
      VITE_IS_PRODUCTION: process.env.VITE_IS_PRODUCTION || 'false'
    })
  ]
}
