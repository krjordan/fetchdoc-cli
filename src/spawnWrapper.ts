import { spawn as cpSpawn, SpawnOptions, ChildProcess } from 'child_process'

/**
 * Spawns a child process with the given command, arguments, and options.
 *
 * @param {string} command - The command to execute.
 * @param {ReadonlyArray<string>} args - The arguments to pass to the command (default: []).
 * @param {SpawnOptions} options - The options for spawning the child process.
 * @return {ChildProcess} - The spawned child process.
 */
export function spawn(
	command: string,
	args: ReadonlyArray<string> = [],
	options: SpawnOptions,
): ChildProcess {
	return cpSpawn(command, args, options)
}
