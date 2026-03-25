"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getActors, getMapData, getUrgencyAlerts } from "@/lib/data/platform-api";
import {
  getSectorName,
  getSectorColor,
  ZONES,
  SECTORS_META,
} from "@/lib/data/zones";
import type { MapZoneData, Sector, Actor, UrgencyAlert } from "@/lib/types/platform";
import {
  AlertTriangle, Users, Layers, ShieldAlert, CheckCircle2, XCircle, X,
} from "lucide-react";

// ---- SVG Governorate Paths ----
type GovernorateId = "akkar" | "north" | "baalbek_hermel" | "mount_lebanon" | "beirut" | "bekaa" | "south" | "nabatieh";

const GOVERNORATE_PATHS: Record<GovernorateId, { d: string; labelX: number; labelY: number }> = {
  akkar: { d: "M334.53,149.92L327.42,140.63L307.32,141.04L296.69,143.5L288.58,142.55L286.87,127.5L277.68,116.8L285.58,113.58L288.95,102.18L288.14,89.36L283.87,72.56L285.54,66.75L288.57,66.65L288.74,69.35L293.67,68.35L293.23,69.64L301.88,74.88L307.19,74.75L310.47,71.82L313.69,74.64L315.52,72.4L319.34,74.34L320.97,71.67L326.38,72.69L328.56,69.65L343.52,74.56L352.25,71.24L359.78,75.48L360.29,74.06L363.27,74.92L365.19,71.73L371.83,75.05L375.41,74.64L383.34,70.07L384.86,64.64L383.11,60.13L385.52,54.71L392.1,51.61L396.41,52.42L398.91,55.03L397.5,62.77L400.29,67.61L407.45,73.04L409.76,73.84L412.71,71.24L419.26,75.31L427.91,71.35L432.14,71.76L429.82,76.12L430.87,81.05L428.29,87.75L422.32,87.64L420.44,83.21L416.9,82.72L417.02,80.46L413.63,82.22L414.67,84.74L411.32,93.64L417.06,98.18L415.26,102.79L408.88,104.11L407.58,107.71L404.44,108.51L393.57,119.92L392.13,113.07L386.88,115.78L383.87,122.1L380.61,123.74L378.86,129.21L370.42,136.01L364.93,136.92L364.73,141.71L366.84,142.88L365.55,151.01L362.63,151.3L361.23,148.71L358.62,151.76L355.96,150.56L347.47,153.14L334.53,149.92Z", labelX: 350, labelY: 100 },
  north: { d: "M184.81,226.91L188.64,214.08L185.79,201.04L192.18,196.78L192.02,193.11L194.51,189.95L198.53,189.58L201.98,192.53L205.16,190.35L203.74,188.64L205.27,190.33L206.52,188.95L209.75,179.79L209.76,174.21L207.95,171.9L210.84,171.81L211.79,166.38L223.16,164.04L236.26,154.41L237.12,149.14L234.71,147.15L234.99,141.74L232.82,140.77L232.89,137.82L235.58,136.81L235.09,138.01L238.56,139.18L238.48,135.99L239.87,138.88L241.6,138.34L239.83,136.66L241.65,138.27L244.0,136.49L248.26,137.33L261.93,133.55L277.68,116.8L286.87,127.5L288.58,142.55L296.69,143.5L307.32,141.04L327.54,140.65L333.71,147.48L337.24,156.82L341.53,160.83L346.21,162.15L345.93,177.33L341.39,179.22L334.0,190.89L333.24,198.95L324.38,205.63L310.22,226.27L305.31,229.03L297.39,241.0L292.66,242.33L301.86,243.8L295.92,257.57L294.45,250.31L280.65,244.75L279.33,245.68L276.45,243.03L272.66,243.48L270.94,246.66L254.91,248.23L256.26,245.96L254.48,240.72L259.57,234.57L257.44,232.71L255.48,233.55L254.73,231.06L250.13,239.94L242.78,234.1L237.08,235.22L234.37,232.86L234.2,237.45L228.39,237.51L227.31,233.25L222.68,231.92L217.97,236.53L210.79,236.99L205.75,232.94L198.72,233.48L194.51,228.94L194.74,226.92L184.81,226.91Z", labelX: 270, labelY: 190 },
  baalbek_hermel: { d: "M263.19,328.07L256.82,325.64L254.53,322.12L261.72,316.01L261.78,308.77L265.56,302.92L274.2,298.59L280.69,288.2L281.74,289.68L286.64,272.38L292.32,271.68L293.15,263.53L301.86,243.8L292.66,242.33L297.39,241.0L305.31,229.03L310.22,226.27L324.38,205.63L333.24,198.95L334.0,190.89L341.39,179.22L345.93,177.33L346.21,162.15L338.45,158.16L334.53,149.92L347.47,153.14L355.96,150.56L358.62,151.76L361.23,148.71L362.63,151.3L365.55,151.01L366.84,142.88L364.73,141.71L364.93,136.92L370.42,136.01L378.86,129.21L384.64,118.08L392.08,113.04L393.41,119.93L397.48,117.8L405.2,120.15L405.44,122.04L407.59,120.27L408.69,122.77L411.53,121.6L417.87,123.77L424.37,120.69L432.18,135.0L445.4,140.26L446.9,141.81L445.42,143.55L449.2,145.06L450.03,148.13L451.17,146.32L452.45,148.74L457.96,148.97L461.43,159.1L451.58,168.92L456.75,179.83L461.92,184.9L459.78,190.9L465.45,195.6L472.73,198.11L465.38,203.61L468.45,212.62L467.8,219.17L469.8,222.38L473.61,223.34L478.58,227.97L479.99,232.46L474.32,233.79L469.23,239.09L467.84,245.53L463.68,248.23L465.06,250.89L463.01,254.96L455.49,257.54L445.93,267.4L444.94,270.84L447.36,276.48L442.61,283.29L443.23,284.97L437.12,289.67L427.73,284.95L426.48,284.85L429.18,287.72L420.38,283.81L417.62,288.49L415.77,287.2L413.15,288.57L414.38,293.7L409.91,293.22L407.64,300.05L403.67,302.1L401.44,309.92L399.74,309.14L394.82,311.92L387.52,318.55L375.51,338.89L393.46,349.48L403.15,351.78L409.7,356.72L410.28,365.27L382.21,364.36L376.17,357.71L368.05,355.68L364.08,360.04L363.47,364.06L346.69,365.12L343.26,364.56L341.39,359.52L337.53,360.0L333.18,364.63L325.85,364.41L326.87,366.54L325.2,369.38L316.83,371.05L314.77,368.55L312.69,368.99L315.72,366.07L314.01,365.99L318.12,356.84L321.79,354.7L319.42,351.73L316.63,353.27L313.64,349.95L306.43,352.64L302.38,349.9L303.28,348.51L300.82,346.07L300.39,348.49L298.93,347.37L290.52,355.65L291.0,352.38L285.44,346.36L286.49,344.36L281.56,336.96L278.31,334.37L274.31,336.85L267.41,333.77L265.58,328.27L263.19,328.07Z", labelX: 400, labelY: 250 },
  mount_lebanon: { d: "M177.38,488.84L175.75,488.96L176.14,484.26L173.08,484.46L175.3,478.39L173.68,471.49L168.29,465.98L171.95,460.15L169.11,452.53L165.65,452.68L163.81,455.52L163.59,453.01L158.65,450.58L150.43,457.05L144.49,456.73L143.73,457.97L146.62,458.72L143.83,460.57L135.28,461.78L133.07,458.95L131.9,463.1L131.3,461.12L129.75,462.53L125.43,461.77L123.83,458.94L120.25,460.4L116.88,456.55L105.46,453.56L106.27,447.16L108.51,446.7L109.59,443.06L109.1,432.42L114.25,430.17L114.55,417.39L116.64,414.74L120.82,413.77L125.33,393.88L133.47,379.78L134.84,369.14L133.22,362.0L134.48,363.64L135.24,361.55L133.79,352.19L140.87,351.97L140.93,353.66L143.2,353.76L145.74,349.39L149.12,348.48L152.83,338.66L156.79,340.84L163.31,337.15L170.35,313.83L173.21,312.43L174.57,308.27L179.93,309.37L183.43,304.4L183.3,299.42L178.23,298.08L176.95,295.22L178.69,292.67L177.86,289.9L183.23,282.0L185.74,269.04L184.92,261.82L182.74,259.3L183.17,254.63L178.33,250.31L181.87,229.13L184.81,226.91L193.94,226.7L198.86,233.56L205.75,232.94L210.41,236.86L214.12,237.42L217.97,236.53L222.68,231.92L227.31,233.25L228.39,237.51L234.26,237.4L233.33,232.88L237.08,235.22L242.56,234.01L250.13,239.94L254.73,231.06L255.48,233.55L257.44,232.71L259.57,234.57L254.48,240.72L256.26,245.96L254.91,248.23L270.94,246.66L272.66,243.48L276.45,243.03L279.33,245.68L280.65,244.75L294.5,250.35L295.92,257.57L293.15,263.53L292.32,271.68L286.64,272.38L281.74,289.68L280.69,288.2L274.2,298.59L265.56,302.92L261.78,308.77L261.72,316.01L254.53,322.12L256.82,325.64L263.19,328.07L261.18,331.19L254.48,335.29L249.99,333.9L247.21,338.45L249.41,340.09L248.88,342.23L244.9,343.38L245.23,346.54L241.15,348.49L238.09,354.07L230.2,361.69L231.64,367.2L228.41,368.27L228.72,373.24L220.74,373.14L225.0,379.87L234.06,379.55L234.32,381.29L228.99,394.07L219.23,401.97L216.86,414.42L214.51,411.13L204.07,422.21L202.71,427.85L204.6,429.99L201.65,429.16L199.57,424.65L186.83,453.57L185.62,465.04L180.7,474.5L179.78,486.19L177.38,488.84Z", labelX: 200, labelY: 370 },
  beirut: { d: "M134.16,352.1L133.46,346.66L130.4,344.83L130.46,340.23L143.73,338.67L149.98,334.31L142.39,339.2L146.12,339.72L149.2,336.76L152.83,338.66L149.12,348.48L145.74,349.39L143.2,353.76L140.93,353.66L140.87,351.97L134.16,352.1Z", labelX: 140, labelY: 344 },
  bekaa: { d: "M229.59,542.44L219.68,536.59L227.4,521.42L223.89,520.12L221.02,511.91L217.03,507.9L218.27,497.64L214.54,493.8L201.09,500.99L199.28,500.93L199.04,498.42L196.46,498.38L195.87,504.04L187.88,514.93L185.5,509.53L179.93,512.38L181.62,505.76L179.31,504.73L173.14,511.12L175.45,504.08L174.67,500.19L177.38,488.84L179.78,486.19L179.63,477.95L185.62,465.04L186.83,453.57L192.79,437.97L199.57,424.65L201.65,429.16L204.52,430.04L202.71,427.85L204.07,422.21L214.51,411.13L216.86,414.42L219.23,401.97L228.99,394.07L234.32,381.29L234.06,379.55L225.0,379.87L220.74,373.14L228.72,373.24L228.41,368.27L231.64,367.2L230.2,361.69L238.09,354.07L241.15,348.49L245.23,346.54L244.9,343.38L248.88,342.23L249.41,340.09L247.21,338.45L249.99,333.9L253.44,335.48L258.74,333.74L263.89,327.65L265.82,328.63L267.09,333.6L274.31,336.85L278.31,334.37L282.57,338.01L286.49,344.36L285.44,346.36L291.0,352.38L290.52,355.65L298.93,347.37L300.39,348.49L300.82,346.07L303.28,348.51L302.38,349.9L306.43,352.64L313.64,349.95L316.54,353.24L319.42,351.73L321.78,354.52L318.12,356.84L314.01,365.99L315.72,366.07L312.95,368.14L301.25,389.12L294.99,387.71L287.74,403.6L283.86,402.44L281.8,412.95L283.91,417.1L281.51,421.79L275.5,423.44L274.94,427.68L271.55,431.15L272.48,435.28L276.53,437.18L284.0,437.57L285.15,436.08L293.2,442.72L301.25,446.4L308.57,452.46L311.48,457.45L299.68,470.98L282.07,474.05L274.68,477.29L274.64,482.74L278.96,486.13L276.11,496.23L261.34,509.69L239.03,523.56L236.68,528.16L236.05,537.57L229.59,542.44Z", labelX: 270, labelY: 440 },
  south: { d: "M78.38,629.41L58.2,633.85L52.79,632.06L51.44,636.0L41.63,634.25L35.71,637.12L35.85,635.1L20.0,634.0L22.84,627.23L33.83,620.7L39.09,608.73L45.19,606.0L47.98,596.58L50.23,595.36L52.77,576.04L50.24,571.48L46.43,571.1L46.27,568.08L50.02,568.94L53.43,565.95L56.21,555.48L62.83,546.53L65.38,526.27L72.44,505.84L75.99,499.64L83.83,495.92L91.97,483.27L95.0,482.03L99.72,461.98L101.91,461.81L105.46,453.56L116.88,456.55L120.25,460.4L123.83,458.94L125.43,461.77L129.75,462.53L131.3,461.12L131.9,463.1L133.07,458.95L135.28,461.78L143.83,460.57L146.62,458.72L143.73,457.97L144.49,456.73L150.43,457.05L158.65,450.58L163.59,453.01L163.81,455.52L165.65,452.68L169.11,452.53L171.95,460.15L168.29,465.98L173.68,471.49L175.3,478.39L173.08,484.46L176.14,484.26L175.75,488.96L177.86,489.36L173.14,511.12L175.12,510.61L177.65,504.95L181.62,505.76L177.29,518.1L175.65,516.56L173.55,517.63L168.08,529.13L160.65,529.1L156.53,531.57L152.55,540.58L150.99,533.98L147.41,534.94L147.33,526.58L153.14,515.46L147.27,512.5L147.35,509.8L152.26,504.24L146.5,500.97L148.37,495.81L153.71,492.69L154.35,490.75L151.71,491.08L156.05,484.28L150.94,482.68L148.97,484.8L150.02,482.3L148.6,481.96L144.61,487.67L140.34,487.25L135.06,491.31L133.98,495.19L127.68,489.63L128.19,492.78L126.33,494.96L119.28,490.17L117.46,493.68L112.07,494.81L118.32,500.11L115.37,502.33L115.84,504.5L108.44,501.24L106.78,505.32L106.69,514.99L111.11,521.27L102.56,523.5L100.94,525.77L93.74,521.29L88.76,524.72L87.06,522.19L87.14,524.05L83.58,526.32L85.86,528.17L82.26,529.9L85.44,531.13L83.99,535.3L77.91,534.03L82.18,536.27L91.13,536.73L94.3,540.94L99.28,538.73L98.65,544.55L92.82,549.07L91.93,552.5L94.44,551.54L93.74,553.83L97.09,556.11L100.37,554.46L102.02,557.26L105.43,557.03L107.02,555.01L111.11,558.85L116.2,553.34L119.22,554.18L117.64,557.75L113.41,560.25L114.08,561.92L112.88,561.47L114.26,564.61L119.19,565.0L118.56,569.23L117.42,570.68L114.82,569.69L116.15,571.53L113.04,573.78L114.78,580.01L112.16,581.88L108.37,577.36L106.08,580.03L105.37,585.69L100.27,585.71L96.99,588.7L103.46,593.07L99.02,593.23L98.8,595.89L92.35,595.52L94.36,599.41L89.46,605.93L83.46,603.51L86.38,608.16L82.78,609.47L80.3,615.78L79.17,621.41L80.52,627.88L78.38,629.41Z", labelX: 65, labelY: 500 },
  nabatieh: { d: "M78.38,629.41L80.52,627.88L79.17,621.41L80.3,615.78L82.78,609.47L86.38,608.16L83.46,603.51L89.46,605.93L94.36,599.41L92.35,595.52L98.8,595.89L99.02,593.23L103.36,593.17L97.27,589.58L97.54,587.61L105.37,585.69L106.08,580.03L108.37,577.36L112.16,581.88L114.78,580.01L113.04,573.78L116.15,571.53L114.82,569.69L117.42,570.68L118.66,569.03L119.03,564.3L114.35,564.66L112.88,561.47L117.64,557.75L119.12,553.97L116.2,553.34L111.11,558.85L107.02,555.01L105.43,557.03L102.02,557.26L100.37,554.46L97.09,556.11L93.74,553.83L94.44,551.54L91.93,552.5L92.82,549.07L98.65,544.55L99.28,538.73L94.3,540.94L91.13,536.73L77.81,534.88L79.35,533.6L83.99,535.3L85.44,531.13L82.26,529.9L85.86,528.17L83.58,526.32L87.14,524.05L87.06,522.19L88.76,524.72L93.74,521.29L100.94,525.77L102.56,523.5L111.11,521.27L106.69,514.99L106.78,505.32L108.44,501.24L115.84,504.5L115.37,502.33L118.32,500.11L112.07,494.81L117.46,493.68L119.28,490.17L126.33,494.96L128.19,492.78L127.68,489.63L133.98,495.19L135.06,491.31L140.34,487.25L144.61,487.67L147.7,482.08L150.02,482.3L148.97,484.8L150.94,482.68L156.05,484.02L151.71,491.08L154.35,490.75L153.71,492.69L148.37,495.81L146.5,500.97L152.26,504.24L147.35,509.8L148.82,514.59L153.14,515.46L147.48,526.08L147.23,531.5L147.41,534.94L151.44,534.69L152.55,540.58L156.48,531.61L160.65,529.1L168.08,529.13L173.55,517.63L175.65,516.56L177.25,518.15L179.73,512.47L185.5,509.53L188.0,514.86L195.87,504.04L196.46,498.38L199.04,498.42L199.28,500.93L201.09,500.99L214.06,493.67L218.11,497.14L218.94,502.03L216.47,506.68L221.02,511.91L223.89,520.12L227.4,521.42L219.68,536.59L229.59,542.44L221.19,547.21L217.77,552.48L211.62,554.48L199.96,570.25L191.35,577.62L177.6,579.92L169.75,567.3L167.62,565.54L165.95,568.44L165.69,565.63L160.75,562.39L159.63,563.29L159.43,568.98L157.02,574.54L154.11,575.9L154.19,581.68L151.38,583.62L152.88,596.07L148.04,617.62L149.7,619.65L145.97,626.05L140.83,626.9L141.15,634.41L123.66,635.38L119.17,644.55L104.4,646.03L103.14,648.39L97.41,647.64L93.23,639.39L90.63,642.18L87.1,638.56L85.59,631.45L79.78,631.52L78.38,629.41Z", labelX: 155, labelY: 580 },
};

const ZONE_TO_GOV: Record<string, GovernorateId> = {
  bourj_hammoud: "mount_lebanon", dekwaneh: "mount_lebanon", sin_el_fil: "mount_lebanon",
  sabra: "beirut", mar_elias: "beirut", hamra: "beirut", achrafieh: "beirut",
  cola: "beirut", tarik_jdide: "beirut",
  haret_hreik: "mount_lebanon", dahieh: "mount_lebanon", jnah: "mount_lebanon",
  saida: "south", sour: "south", nabatieh: "nabatieh", marjayoun: "nabatieh",
  bint_jbeil: "nabatieh", khiam: "nabatieh",
  zahle: "bekaa", baalbek: "baalbek_hermel", hermel: "baalbek_hermel",
  chtaura: "bekaa", bar_elias: "bekaa", anjar: "bekaa",
  tripoli: "north", bcharre: "north", zgharta: "north", batroun: "north",
  akkar_town: "akkar", halba: "akkar", mina: "north",
};

const GOV_NAMES: Record<string, Record<GovernorateId, string>> = {
  en: {
    akkar: "Akkar", north: "North", baalbek_hermel: "Baalbek-Hermel",
    mount_lebanon: "Mt. Lebanon", beirut: "Beirut", bekaa: "Bekaa",
    south: "South", nabatieh: "Nabatieh",
  },
  ar: {
    akkar: "عكار", north: "الشمال", baalbek_hermel: "بعلبك-الهرمل",
    mount_lebanon: "جبل لبنان", beirut: "بيروت", bekaa: "البقاع",
    south: "الجنوب", nabatieh: "النبطية",
  },
};

// Project lat/lng to SVG coordinates (calibrated from known governorate positions)
function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  // Reference points: Akkar(34.53,36.08)→(350,100), Beirut(33.89,35.49)→(140,344), Nabatieh(33.38,35.48)→(155,580)
  const x = 140 + (lng - 35.49) * 356;
  const y = 100 + (34.53 - lat) * 417;
  return { x, y };
}

function getGovColor(actors: number, gaps: number): string {
  if (actors === 0) return "var(--color-heatmap-none)";
  if (gaps >= 7) return "var(--color-heatmap-critical)";
  if (gaps >= 5) return "var(--color-heatmap-high)";
  if (gaps >= 3) return "var(--color-heatmap-mid)";
  return "var(--color-heatmap-low)";
}

function getGovBorder(actors: number, gaps: number): string {
  if (actors === 0) return "var(--color-muted)";
  if (gaps >= 7) return "var(--color-danger-dark)";
  if (gaps >= 5) return "var(--color-high)";
  if (gaps >= 3) return "var(--color-warning)";
  return "var(--color-success-dark)";
}

type DisplayZoneData = MapZoneData & {
  overallActorCount: number;
};

export default function MapPage() {
  const locale = useLocale();
  const t = useTranslations("platform");
  const govNames = GOV_NAMES[locale] || GOV_NAMES.en;
  const [zoneData, setZoneData] = useState<MapZoneData[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [alerts, setAlerts] = useState<UrgencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState<Sector | null>(null);
  const [hovered, setHovered] = useState<GovernorateId | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedGov, setSelectedGov] = useState<GovernorateId | null>(null);

  useEffect(() => {
    Promise.all([getMapData(), getActors(), getUrgencyAlerts()])
      .then(([data, a, urgencyAlerts]) => {
        setZoneData(data);
        setActors(a);
        setAlerts(urgencyAlerts);
      })
      .finally(() => setLoading(false));
  }, []);

  const zoneDataById = new Map(zoneData.map((zone) => [zone.zoneId, zone]));
  const activeAlerts = alerts.filter((alert) => alert.status === "active");

  const displayZoneData = ZONES.map((zone): DisplayZoneData => {
    const baseZone = zoneDataById.get(zone.id) ?? {
      zoneId: zone.id,
      activeSectors: [],
      actorCount: 0,
      gaps: [],
      hasUrgencyAlert: false,
      freshness: "outdated" as const,
    };

    if (!activeSector) {
      return {
        ...baseZone,
        hasUrgencyAlert: activeAlerts.some((alert) => alert.zone === zone.id),
        overallActorCount: baseZone.actorCount,
      };
    }

    const sectorActors = actors.filter(
      (actor) =>
        actor.verificationStatus !== "suspended" &&
        actor.operationalZones.includes(zone.id) &&
        actor.sectors.includes(activeSector)
    );

    return {
      zoneId: zone.id,
      activeSectors: sectorActors.length > 0 ? [activeSector] : [],
      actorCount: sectorActors.length,
      gaps: sectorActors.length > 0 ? [] : [activeSector],
      hasUrgencyAlert: activeAlerts.some(
        (alert) => alert.zone === zone.id && alert.category === activeSector
      ),
      freshness: baseZone.freshness,
      overallActorCount: baseZone.actorCount,
    };
  });

  const displayZoneDataById = new Map(displayZoneData.map((zone) => [zone.zoneId, zone]));

  // Aggregate zone data per governorate
  const govData = (Object.keys(GOVERNORATE_PATHS) as GovernorateId[]).map((govId) => {
    const govZoneIds = Object.entries(ZONE_TO_GOV).filter(([, g]) => g === govId).map(([z]) => z);
    const zones = govZoneIds
      .map((zoneId) => displayZoneDataById.get(zoneId))
      .filter((zone): zone is DisplayZoneData => Boolean(zone));
    const totalActors = zones.reduce((s, z) => s + z.actorCount, 0);
    const overallActors = zones.reduce((sum, zone) => sum + zone.overallActorCount, 0);
    const allSectors = activeSector
      ? (totalActors > 0 ? [activeSector] : [])
      : [...new Set(zones.flatMap((z) => z.activeSectors))] as Sector[];
    const allGaps = activeSector
      ? (totalActors > 0 ? [] : [activeSector])
      : [...new Set(zones.flatMap((z) => z.gaps))] as Sector[];
    const hasAlert = zones.some((z) => z.hasUrgencyAlert);
    return {
      govId,
      totalActors,
      overallActors,
      sectors: allSectors,
      gaps: allGaps,
      hasAlert,
      zones,
      zoneIds: govZoneIds,
    };
  });

  const selectedDetail = selectedGov
    ? govData.find((gov) => gov.govId === selectedGov) ?? null
    : null;

  // Get zone pins to show on map
  const visibleZones = ZONES.filter((z) => {
    const zd = displayZoneDataById.get(z.id);
    if (!zd) return false;
    if (zd.actorCount === 0 && zd.gaps.length === 0) return false;
    if (activeSector) {
      return zd.activeSectors.includes(activeSector) || zd.gaps.includes(activeSector);
    }
    return true;
  });

  return (
    <div className="py-2 space-y-3">
      {/* Sector filter */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t("map.filterBySector")}</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveSector(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeSector ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600"}`}
          >{t("map.all")}</button>
          {SECTORS_META.map((s) => (
            <button key={s.id} onClick={() => setActiveSector(activeSector === s.id as Sector ? null : s.id as Sector)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeSector === s.id ? "text-white" : "bg-white border border-slate-200 text-slate-600"}`}
              style={activeSector === s.id ? { backgroundColor: s.color } : undefined}
            >{locale === "ar" ? s.nameAr : s.nameEn}</button>
          ))}
        </div>
      </div>

      {/* SVG Map — full width */}
      {loading ? (
        <div className="h-[500px] bg-slate-100 rounded-lg animate-pulse" />
      ) : (
        <div className="relative bg-white rounded-lg border border-slate-200 p-2">
          <svg viewBox="-10 30 520 640" className="w-full" style={{ maxHeight: "70vh" }}>
            <defs>
              <filter id="mshadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
              </filter>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Governorate polygons */}
            {govData.map(({ govId, totalActors, overallActors, gaps }) => {
              const { d } = GOVERNORATE_PATHS[govId];
              const isHovered = hovered === govId;
              const isSelected = selectedGov === govId;
              const filteredHasCoverage = totalActors > 0;
              const filteredHasUnderlyingData = overallActors > 0;
              const fillColor = activeSector
                ? filteredHasCoverage
                  ? "var(--color-heatmap-low)"
                  : filteredHasUnderlyingData
                    ? "var(--color-heatmap-critical)"
                    : "var(--color-heatmap-none)"
                : getGovColor(totalActors, gaps.length);
              const borderColor = activeSector
                ? filteredHasCoverage
                  ? "var(--color-success-dark)"
                  : filteredHasUnderlyingData
                    ? "var(--color-danger-dark)"
                    : "var(--color-muted)"
                : getGovBorder(totalActors, gaps.length);
              return (
                <path key={govId} d={d}
                  data-testid={`gov-${govId}`}
                  fill={fillColor}
                  stroke={isHovered || isSelected ? "var(--color-primary)" : borderColor}
                  strokeWidth={isHovered || isSelected ? 2.5 : 1}
                  strokeLinejoin="round"
                  filter={isHovered ? "url(#mshadow)" : undefined}
                  opacity={selectedGov && selectedGov !== govId ? 0.3 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHovered(govId)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelectedGov(selectedGov === govId ? null : govId)}
                />
              );
            })}

            {/* Governorate labels */}
            {govData.map(({ govId, totalActors }) => {
              const { labelX, labelY } = GOVERNORATE_PATHS[govId];
              if (selectedGov && selectedGov !== govId) return null;
              return (
                <text key={`lbl-${govId}`} x={labelX} y={labelY + (totalActors > 0 ? 24 : 5)}
                  textAnchor="middle" fontSize={govId === "beirut" ? "8" : "10"} fontWeight="600"
                  fill="var(--color-sub)" opacity={0.4} className="pointer-events-none select-none"
                >{govNames[govId]}</text>
              );
            })}

            {/* Governorate-level badges (when no gov selected) */}
            {!selectedGov && govData.map(({ govId, totalActors, overallActors, gaps, hasAlert }) => {
              const shouldShowBadge = activeSector ? overallActors > 0 : totalActors > 0;
              if (!shouldShowBadge) return null;
              const { labelX, labelY } = GOVERNORATE_PATHS[govId];
              const badgeColor = activeSector
                ? totalActors > 0
                  ? "var(--color-primary)"
                  : "var(--color-danger)"
                : gaps.length > 3
                  ? "var(--color-danger)"
                  : "var(--color-primary)";
              return (
                <g key={`badge-${govId}`} data-testid={`gov-badge-${govId}`} className="pointer-events-none">
                  <circle cx={labelX} cy={labelY} r={govId === "beirut" ? 11 : 14} fill={badgeColor} opacity={0.9} />
                  <text
                    x={labelX}
                    y={labelY + (govId === "beirut" ? 4 : 5)}
                    textAnchor="middle"
                    fontSize={govId === "beirut" ? "11" : "13"}
                    fontWeight="700"
                    fill="white"
                    data-testid={`gov-badge-count-${govId}`}
                  >
                    {totalActors}
                  </text>
                  {hasAlert && (
                    <>
                      <circle cx={labelX + (govId === "beirut" ? 12 : 16)} cy={labelY - 12} r={6} fill="var(--color-danger)" />
                      <text x={labelX + (govId === "beirut" ? 12 : 16)} y={labelY - 9} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">!</text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Zone-level pins (always visible, bigger when gov selected) */}
            {visibleZones.map((zone) => {
              const { x, y } = latLngToSvg(zone.lat, zone.lng);
              const zd = displayZoneDataById.get(zone.id);
              if (!zd) return null;
              const inSelectedGov = !selectedGov || ZONE_TO_GOV[zone.id] === selectedGov;
              if (!inSelectedGov) return null;
              const isZoneHovered = hoveredZone === zone.id;
              const pinSize = selectedGov ? 8 : 5;
              const hasGaps = zd.gaps.length > 0;
              const pinColor = activeSector
                ? zd.actorCount > 0
                  ? "var(--color-success)"
                  : zd.overallActorCount > 0
                    ? "var(--color-high)"
                    : "var(--color-muted)"
                : zd.actorCount === 0
                  ? "var(--color-muted)"
                  : hasGaps
                    ? "var(--color-high)"
                    : "var(--color-success)";

              return (
                <g key={`pin-${zone.id}`}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="cursor-pointer"
                >
                  {/* Outer ring for alert */}
                  {zd.hasUrgencyAlert && (
                    <circle cx={x} cy={y} r={pinSize + 4} fill="none" stroke="var(--color-danger)" strokeWidth={1.5} opacity={0.6}>
                      <animate attributeName="r" values={`${pinSize + 3};${pinSize + 6};${pinSize + 3}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Pin dot */}
                  <circle cx={x} cy={y} r={isZoneHovered ? pinSize + 2 : pinSize}
                    fill={pinColor} stroke="white" strokeWidth={selectedGov ? 2 : 1}
                    filter={isZoneHovered ? "url(#mshadow)" : undefined}
                    className="transition-all duration-150"
                  />
                  {/* Actor count on pin (when gov is selected) */}
                  {selectedGov && zd.actorCount > 0 && (
                    <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="white" className="pointer-events-none">{zd.actorCount}</text>
                  )}
                  {/* Zone label (when gov selected or hovered) */}
                  {(selectedGov || isZoneHovered) && (
                    <text x={x} y={y + pinSize + 12} textAnchor="middle" fontSize="8" fontWeight="600"
                      fill="var(--color-primary)" className="pointer-events-none select-none"
                    >{locale === "ar" ? zone.nameAr : zone.nameEn}</text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip for zones */}
          {hoveredZone && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 max-w-[240px]">
              {(() => {
                const zone = ZONES.find((z) => z.id === hoveredZone);
                const zd = displayZoneDataById.get(hoveredZone);
                if (!zone || !zd) return null;
                return (
                  <div>
                    <div className="font-bold">{locale === "ar" ? zone.nameAr : zone.nameEn}</div>
                    <div className="flex gap-3 mt-1">
                      <span>{zd.actorCount} {t("map.orgs")}</span>
                      <span>{zd.activeSectors.length} {t("map.sectors")}</span>
                      {zd.gaps.length > 0 && <span className="text-red-300">{zd.gaps.length} {t("map.gaps")}</span>}
                    </div>
                    {zd.activeSectors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {zd.activeSectors.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: getSectorColor(s), color: "white" }}>
                            {getSectorName(s, locale)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Hover tooltip for governorates */}
          {hovered && !hoveredZone && !selectedGov && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 pointer-events-none z-10">
              {govNames[hovered]} — <span className="font-bold">{govData.find((g) => g.govId === hovered)?.totalActors || 0}</span> {t("map.orgs")}
              {(govData.find((g) => g.govId === hovered)?.gaps.length || 0) > 0 && (
                <span className="text-red-300 ms-1">· {govData.find((g) => g.govId === hovered)?.gaps.length} {t("map.gaps")}</span>
              )}
              <span className="text-slate-400 ms-2">{t("map.clickToZoom")}</span>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-heatmap-low border border-green-400" /> {t("map.legendGood")}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-heatmap-mid border border-amber-400" /> {t("map.legendGaps")}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-heatmap-critical border border-red-400" /> {t("map.legendCritical")}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> {t("map.legendZoneOk")}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-high" /> {t("map.legendZoneGaps")}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" /> {t("map.legendAlert")}</span>
          </div>
        </div>
      )}

      {/* Selected governorate detail panel */}
      {selectedDetail && (
        <div className="bg-white rounded-lg border-2 border-primary/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">{govNames[selectedDetail.govId]}</h3>
            <button onClick={() => setSelectedGov(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="flex gap-4 text-sm text-slate-600 mb-3">
            <span className="flex items-center gap-1" data-testid="gov-detail-actors"><Users className="w-4 h-4" /> {selectedDetail.totalActors} {t("map.orgs")}</span>
            <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {selectedDetail.sectors.length} {t("map.sectors")}</span>
            <span className="flex items-center gap-1">
              {selectedDetail.gaps.length > 0 ? <ShieldAlert className="w-4 h-4 text-danger" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
              {selectedDetail.gaps.length} {t("map.gaps")}
            </span>
          </div>
          {selectedDetail.sectors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">{t("map.activeSectors")}</p>
              <div className="flex flex-wrap gap-1">
                {selectedDetail.sectors.map((s) => (
                  <span key={s} data-testid={`gov-detail-sector-${s}`} className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: getSectorColor(s) }}>{getSectorName(s, locale)}</span>
                ))}
              </div>
            </div>
          )}
          {selectedDetail.gaps.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-danger flex items-center gap-1 mb-1"><XCircle className="w-3.5 h-3.5" /> {t("map.noCoverage")}</p>
              <div className="flex flex-wrap gap-1">
                {selectedDetail.gaps.map((s) => (
                  <span key={s} data-testid={`gov-detail-gap-${s}`} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">{getSectorName(s, locale)}</span>
                ))}
              </div>
            </div>
          )}
          {selectedDetail.hasAlert && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4" /> {t("map.activeUrgencyAlert")}
            </div>
          )}
          {/* Zone breakdown */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2">{t("map.zonesIn", { name: govNames[selectedDetail.govId] })}</p>
            <div className="space-y-2">
              {selectedDetail.zones.filter((z) => z.actorCount > 0).map((z) => {
                const zone = ZONES.find((zz) => zz.id === z.zoneId);
                return (
                  <div key={z.zoneId} className="bg-slate-50 rounded-xl p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{locale === "ar" ? zone?.nameAr : zone?.nameEn}</span>
                      <span className="text-xs text-slate-500">{z.actorCount} {t("map.orgs")}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {z.activeSectors.map((s) => (
                        <span key={s} className="w-2 h-2 rounded-full" style={{ backgroundColor: getSectorColor(s) }} title={getSectorName(s, locale)} />
                      ))}
                      {z.gaps.length > 0 && (
                        <span className="text-[10px] text-red-600 ms-1">{z.gaps.length} {t("map.gaps")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
