import { StartPlugin } from '@start/plugin-sequence'

export default (formats: string[] = ['lcovonly', 'text-summary']) => {
  const istanbulReport: StartPlugin = async ({ input, logMessage }) => {
    const { default: { createCoverageMap } } = await import('istanbul-lib-coverage')
    const { default: { createSourceMapStore } } = await import('istanbul-lib-source-maps')
    const { default: { createReporter } } = await import('istanbul-api')
    const hooks = await import('./hooks')
    const { default: coverageVariable } = await import('./variable')

    hooks.clearAll()

    if (!global[coverageVariable]) {
      logMessage('no coverage information was collected')

      return input
    }

    const coverageMap = createCoverageMap(global[coverageVariable])
    const sourceMapStore = createSourceMapStore()
    const remappedCoverageMap = sourceMapStore.transformCoverage(coverageMap).map
    const reporter = createReporter()

    logMessage(formats.join(', '))

    formats.forEach((format) => {
      reporter.add(format)
      reporter.write(remappedCoverageMap)
    })

    return input
  }

  return istanbulReport
}