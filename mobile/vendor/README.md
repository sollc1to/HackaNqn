# Módulos Expo locales

Este directorio contiene `expo-image-picker` 57.0.10 y `expo-image-loader` 57.0.1,
tomados del repositorio oficial `expo/expo` para mantener el selector de cámara
y biblioteca reproducible en este proyecto Expo 57 sin depender de una descarga
durante la instalación.

Se conservaron los módulos nativos y la implementación web. Los imports públicos
del código fuente fueron ajustados a `expo-modules-core`, que es la dependencia
que expone esas APIs en la instalación actual. La licencia MIT de Expo se incluye
en `LICENSE-EXPO`.
