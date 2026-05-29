declare module '@expo/vector-icons/FontAwesome' {
  import type { ComponentType } from 'react'
  import type { TextStyle } from 'react-native'

  type FontAwesomeProps = {
    name: string
    size?: number
    color?: string
    style?: TextStyle
  }

  const FontAwesome: ComponentType<FontAwesomeProps>

  export default FontAwesome
}

declare module '@expo/vector-icons/MaterialIcons' {
  import type { ComponentType } from 'react'
  import type { TextStyle } from 'react-native'

  type MaterialIconsProps = {
    name: string
    size?: number
    color?: string
    style?: TextStyle
  }

  const MaterialIcons: ComponentType<MaterialIconsProps>

  export default MaterialIcons
}
