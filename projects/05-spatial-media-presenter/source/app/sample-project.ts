export const SAMPLE_SET = "flipframe-portfolio-15-v2";
export const SAVED_BOARD_STORAGE = "spectra:saved-board:v1";

/** Old boards may include real uploads. Archive the whole board before switching
 * to the new gallery; never infer ownership from a title or delete cached files. */
export function needsSampleUpgrade(project: {
  sampleSet?: string;
  items?: { id: string }[];
} | null): boolean {
  return Boolean(project && project.sampleSet !== SAMPLE_SET && project.items?.length
    && !project.items.some((item) => item.id.startsWith("portfolio-")));
}
