// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

interface IconMapping {
  [key: string]: string;
}

type IconSymbolName = string;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "gearshape.fill": "settings",
  gearshape: "settings",
  "switch.2": "swap-horiz",
  "bolt.fill": "bolt",
  bolt: "flash-on",
  "hand.raised.fill": "pan-tool",
  "hand.raised": "unarchive",
  checkmark: "check",
  check: "check",
  "info.circle.fill": "info",
  "info.circle": "info-outline",
  "person.2.fill": "people",
  "person.2": "people-outline",
  "person.fill": "person",
  person: "person-outline",
  "flame.fill": "local-fire-department",
  flame: "whatshot",
  "graduationcap.fill": "school",
  graduationcap: "account-balance",
  "rectangle.portrait.and.arrow.right": "logout",
  exit: "exit-to-app",
  wifi: "wifi",
  "wifi.slash": "wifi-off",
  "checkmark.shield.fill": "verified-user",
  "shield.fill": "security",
  "gauge.with.dots.needle.bottom.50percent": "speed",
  gauge: "speed",
  power: "power-settings-new",
  "power.circle.fill": "power-settings-new",
  "location.fill": "location-on",
  location: "location-off",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  lock: "lock-outline",
  "bell.fill": "notifications",
  bell: "notifications-none",
  "star.fill": "star",
  star: "star-border",
  "heart.fill": "favorite",
  heart: "favorite-border",
  "trash.fill": "delete",
  trash: "delete-outline",
  pencil: "edit",
  "pencil.fill": "edit",
  plus: "add",
  "plus.circle.fill": "add-circle",
  minus: "remove",
  "minus.circle.fill": "remove-circle",
  xmark: "close",
  "xmark.circle.fill": "cancel",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  "chevron.up": "expand-less",
  "chevron.down": "expand-more",
  "chevron.left": "chevron-left",
  magnifyingglass: "search",
  "slider.horizontal.3": "tune",
  "slider.horizontal": "swap-horiz",
  "clock.fill": "schedule",
  calendar: "date-range",
  "envelope.fill": "email",
  envelope: "mail-outline",
  "phone.fill": "phone",
  phone: "phone-iphone",
  "message.fill": "chat",
  message: "chat-bubble-outline",
  "camera.fill": "camera-alt",
  "photo.fill": "image",
  globe: "public",
  link: "link",
  share: "share",
  download: "file-download",
  upload: "file-upload",
  save: "save",
  "folder.fill": "folder",
  folder: "folder-open",
  "document.fill": "description",
  document: "description",
  eye: "visibility",
  "eye.fill": "visibility",
  "eye.slash": "visibility-off",
  "eye.slash.fill": "visibility-off",
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Check if the icon name exists in the mapping
  const mappedName = MAPPING[name];

  // If mapped, use MaterialIcons; otherwise, try to use the icon name directly
  if (mappedName) {
    return (
      <MaterialIcons
        color={color}
        size={size}
        name={mappedName as any}
        style={style}
      />
    );
  }

  // Fallback: try to use the icon name directly with MaterialIcons
  // This allows using Material Icons names directly if SF Symbol mapping doesn't exist
  return (
    <MaterialIcons color={color} size={size} name={name as any} style={style} />
  );
}
