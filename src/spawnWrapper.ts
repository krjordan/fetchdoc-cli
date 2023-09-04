import { spawn as cpSpawn, SpawnOptions, ChildProcess } from 'child_process'

export function spawn(
	command: string,
	args: ReadonlyArray<string> = [],
	options: SpawnOptions,
): ChildProcess {
	return cpSpawn(command, args, options)
}
