import { runCommand } from './exec'

export async function getLastCommitId (cwd: string = process.cwd()): Promise<string> {
  const command = await runCommand(
    'git',
    ['rev-parse', 'HEAD'],
    {
      cwd
    },
    true
  )
  return command.stdout
}
