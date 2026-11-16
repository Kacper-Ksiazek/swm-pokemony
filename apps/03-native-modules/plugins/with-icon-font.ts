import type { ExpoConfig } from "expo/config";
import {
  type ConfigPlugin,
  createRunOncePlugin,
  IOSConfig,
  type InfoPlist,
  withDangerousMod,
  withInfoPlist,
  withXcodeProject,
} from "expo/config-plugins";
import fs from "fs";
import path from "path";

const FONT_EXTENSIONS = new Set([".ttf", ".otf"]);
const ANDROID_ASSETS_FONTS_DIR = "app/src/main/assets/fonts";

export type WithIconFontProps = string | { fontsDir: string };

function resolveFontFiles(projectRoot: string, props: WithIconFontProps): string[] {
  const dir = typeof props === "string" ? props : props.fontsDir;
  const absoluteDir = path.resolve(projectRoot, dir);

  if (!fs.existsSync(absoluteDir)) {
    throw new Error(`[with-icon-font] Font directory does not exist: ${absoluteDir}`);
  }

  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  const fonts = entries
    .filter((entry) => entry.isFile() && FONT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(absoluteDir, entry.name))
    .sort();

  if (fonts.length === 0) {
    throw new Error(`[with-icon-font] No .ttf or .otf files found in: ${absoluteDir}`);
  }

  return fonts;
}

function getUIAppFonts(infoPlist: InfoPlist): string[] {
  const fonts = infoPlist.UIAppFonts;
  if (Array.isArray(fonts) && fonts.every((font) => typeof font === "string")) {
    return fonts;
  }
  return [];
}

function withIconFontIos(config: ExpoConfig, props: WithIconFontProps): ExpoConfig {
  config = withXcodeProject(config, (modConfig) => {
    const fontFiles = resolveFontFiles(modConfig.modRequest.projectRoot, props);
    const project = modConfig.modResults;
    const platformRoot = modConfig.modRequest.platformProjectRoot;

    IOSConfig.XcodeUtils.ensureGroupRecursively(project, "Resources");

    for (const fontFile of fontFiles) {
      IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath: path.relative(platformRoot, fontFile),
        groupName: "Resources",
        project,
        isBuildFile: true,
        verbose: true,
      });
    }

    return modConfig;
  });

  config = withInfoPlist(config, (modConfig) => {
    const fontFiles = resolveFontFiles(modConfig.modRequest.projectRoot, props);
    const existingFonts = getUIAppFonts(modConfig.modResults);
    const fontNames = fontFiles.map((fontFile) => path.basename(fontFile));

    modConfig.modResults.UIAppFonts = Array.from(new Set([...existingFonts, ...fontNames]));
    return modConfig;
  });

  return config;
}

function withIconFontAndroid(config: ExpoConfig, props: WithIconFontProps): ExpoConfig {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const fontFiles = resolveFontFiles(modConfig.modRequest.projectRoot, props);
      const targetDir = path.join(
        modConfig.modRequest.platformProjectRoot,
        ANDROID_ASSETS_FONTS_DIR,
      );

      await fs.promises.mkdir(targetDir, { recursive: true });

      for (const fontFile of fontFiles) {
        const destination = path.join(targetDir, path.basename(fontFile));
        await fs.promises.copyFile(fontFile, destination);
      }

      return modConfig;
    },
  ]);
}

const withIconFont: ConfigPlugin<WithIconFontProps> = (config, props) => {
  config = withIconFontIos(config, props);
  config = withIconFontAndroid(config, props);
  return config;
};

export default createRunOncePlugin(withIconFont, "with-icon-font", "1.0.0");
