export const enum PipelineTaskPriority {
  Input = 50,
  Update = 100,
  UpdateWidget = 150,
  BatchFree = 200,
  LayoutWidget = 250,
  BuildRenderTree = 300,
  Paint = 400,
}
