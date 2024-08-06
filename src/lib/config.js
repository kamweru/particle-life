let colorsArr = [
  { label: "Aqua", value: "#00FFFF" },
  { label: "Aquamarine", value: "#7FFFD4" },
  { label: "BlueViolet", value: "#8A2BE2" },
  { label: "Brown", value: "#A52A2A" },
  { label: "BurlyWood", value: "#DEB887" },
  { label: "CadetBlue", value: "#5F9EA0" },
  { label: "Chartreuse", value: "#7FFF00" },
  { label: "Chocolate", value: "#D2691E" },
  { label: "CornflowerBlue", value: "#6495ED" },
  { label: "Crimson", value: "#DC143C" },
  { label: "Cyan", value: "#00FFFF" },
  { label: "DarkCyan", value: "#008B8B" },
  { label: "DeepPink", value: "#FF1493" },
  { label: "DeepSkyBlue", value: "#00BFFF" },
  { label: "ForestGreen", value: "#228B22" },
  { label: "Fuchsia", value: "#FF00FF" },
  { label: "Gold", value: "#FFD700" },
  { label: "HoneyDew", value: "#F0FFF0" },
  { label: "HotPink", value: "#FF69B4" },
  { label: "IndianRed", value: "#CD5C5C" },
  { label: "Lime", value: "#00FF00" },
  { label: "Orchid", value: "#DA70D6" },
  { label: "Red", value: "#FF0000" },
  { label: "SkyBlue", value: "#87CEEB" },
  { label: "SlateBlue", value: "#6A5ACD" },
  { label: "SlateGray", value: "#708090" },
  { label: "Teal", value: "#008080" },
  { label: "Tomato", value: "#FF6347" },
  { label: "Turquoise", value: "#40E0D0" },
  { label: "Violet", value: "#EE82EE" },
  { label: "Yellow", value: "#FFFF00" },
].sort((a, b) => a.label.localeCompare(b.label));

export const config = {
  menu: [
    { title: "Food vs Poison", key: "foodvsPoison" },
    { title: "Particle Simulation", key: "particleSimulation" },
    { title: "Force Based", key: "forceBased" },
    { title: "Shapes", key: "shapes" },
    { title: "Wavy Propeller", key: "wavyPropeller" },
    { title: "particle Grid", key: "particleGrid" },
    { title: "circular", key: "circular" },
  ],
  activeMenu: "circular",
  loadedControls: "foodvsPoison",
  canvas: {},
  recorder: {
    options: { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 2500000 },
    mediaRecorder: null,
    recordedChunks: [],
    status: "inactive",
  },
  projects: {
    foodvsPoison: {},
    particleSimulation: {},
    particleGrid: {
      controls: [
        {
          label: "Damping",
          inputType: "range",
          id: "damping",
          value: 0.9,
          min: -2,
          max: 2,
          step: 0.0078125,
        },
        {
          label: "interactionRange",
          inputType: "range",
          id: "interactionRange",
          value: 50,
          min: -100,
          max: 500,
          step: 1,
        },
        {
          label: "maxForceRange",
          inputType: "range",
          id: "maxForceRange",
          value: 7,
          min: -20,
          max: 20,
          step: 1,
        },
        {
          label: "maxSpeed",
          inputType: "range",
          id: "maxSpeed",
          value: 2.5,
          min: -20,
          max: 20,
          step: 0.0078125,
        },
        {
          label: "collisionDistance",
          inputType: "range",
          id: "collisionDistance",
          value: 12.5,
          min: -100,
          max: 50,
          step: 0.0078125,
        },
        {
          label: "numParticles",
          inputType: "range",
          id: "numParticles",
          value: 200,
          min: 5,
          max: 500,
          step: 5,
        },
        {
          label: "Select Color",
          inputType: "select",
          options: [{ label: "select color", value: "" }, ...colorsArr],
          id: "selectColor",
          value: "",
        },
      ],
    },
    forceBased: {
      selectedColors: [],
      particleMap: {},
      particles: [],
      colorRuleMap: [],
      minParticles: 10,
      maxParticles: 30,
      controls: [
        {
          label: "min particles",
          inputType: "range",
          id: "minParticles",
          value: 180,
          min: 5,
          max: 1000,
          step: 5,
        },
        {
          label: "max particles",
          inputType: "range",
          id: "maxParticles",
          value: 220,
          min: 5,
          max: 1000,
          step: 5,
        },
        {
          label: "Select Color",
          inputType: "select",
          options: [{ label: "select color", value: "" }, ...colorsArr],
          id: "selectColor",
          value: "",
        },
        {
          label: "Time Factor",
          inputType: "range",
          id: "timeFactor",
          value: -0.1875,
          min: -2,
          max: 2,
          step: 0.0078125,
        },
        {
          label: "threshold Distance",
          inputType: "range",
          id: "thresholdDistance",
          value: 10,
          min: -10,
          max: 20,
          step: 0.0625,
        },
        {
          label: "force Factor",
          inputType: "range",
          id: "forceFactor",
          value: 0.1875,
          min: -1,
          max: 1,
          step: 0.0078125,
        },
        {
          label: "aggregate",
          inputType: "button",
          id: "aggregate",
          value: false,
        },
      ],
    },
  },
};
