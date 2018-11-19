import * as child_process from "child_process"
import * as fs from "fs"
import * as ini from "ini"

export class CDisk {
	id: string
	name: string
	operatingSystems: COperatingSystem[]

	constructor(id: string, name: string) {
		this.id = id
		this.name = name
		this.operatingSystems = []
	}
}

export class COperatingSystem {
	id: string
	name: string
	type: EOperatingSystem
	hostname: string

	constructor(id: string) {
		this.id = id
	}
}

export enum EOperatingSystem {
	Windows,
	Linux,
}

export default function getDisks(): CDisk[] {
	const devices = fs.readdirSync("/dev")
	const disks: CDisk[] = devices.
		filter((device) => /^sd[a-z]+$/.test(device)).
		map((disk) => new CDisk(disk, disk))

	for (const disk of disks) {
		disk.operatingSystems = devices.
			filter((device) => device.startsWith(disk.id) && /^sd[a-z]+\d+$/.test(device)).
			filter((partition) => {
				const device = `/dev/${partition}`
				const mountPoint = `/mnt/${partition}`

				fs.mkdirSync(mountPoint)

				const status = child_process.spawnSync("mount", [
					device,
					mountPoint,
				]).status
				if (status !== 0) {
					fs.rmdirSync(mountPoint)
					return false
				}

				const containsOS = !fs.existsSync(`${mountPoint}/.ignore`) && (fs.existsSync(`${mountPoint}/Windows/System32/config/SAM`) || fs.existsSync(`${mountPoint}/etc/shadow`))

				if (!containsOS) {
					child_process.spawnSync("umount", [mountPoint])
					fs.rmdirSync(mountPoint)
				}

				return containsOS
			}).
			map((partition) => {
				const mountPoint = `/mnt/${partition}`
				const os = new COperatingSystem(partition)

				if (fs.existsSync(`${mountPoint}/Windows/System32/config/SAM`)) {
					os.type = EOperatingSystem.Windows
				} else {
					os.type = EOperatingSystem.Linux
				}

				switch (os.type) {
					// TODO: windows
					case EOperatingSystem.Linux:
						// operating system name
						try {
							// FIXME: potential security risk by buffering the entire file into memory
							os.name = ini.parse(`${fs.readFileSync(`${mountPoint}/etc/os-release`)}`).NAME
						} catch (err) { }
						if (!os.name) {
							os.name = "Linux"
						}

						// operating system hostname
						try {
							os.hostname = `${fs.readFileSync(`${mountPoint}/etc/hostname`)}`
						} catch (err) { }

						break
				}

				return os
			})
	}

	// removes disks without operating systems
	return disks.filter((disk) => disk.operatingSystems.length)
}
