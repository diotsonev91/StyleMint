import { proxy } from "valtio";

const state = proxy({
  intro: true,
  colors: ["#ccc", "#EFBD4E", "#80C670", "#726DE8", "#EF674E", "#353934"],
  decals: [
    "react",
    "three2",
    "pmndrs",
    "style_mint",
    "patata",
    "linux",
    "dyno",
  ],
  selectedColor: "#EFBD4E",
  selectedDecal: "style_mint",
  types: ["t_shirt_sport", "t_shirt_classic", "cap", "hoodie"],
  selected_type: "t_shirt_sport",
});

export { state };
