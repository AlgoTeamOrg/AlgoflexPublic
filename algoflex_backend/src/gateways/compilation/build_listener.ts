import Docker from 'dockerode';
import crypto from 'crypto';
import { DockerTestResult } from '../models';
const parseImage = 'algoflex/parse:1.0';
const compileImage = 'algoflex/compile:1.0';
const executeImage = 'algoflex/execute:1.0';

export default class BuildListener {
  private dockerInstance: Docker;
  private commonVolume?: Docker.Volume;
  private parseContainer?: Docker.Container;
  private compileContainer?: Docker.Container;
  private executeContainer?: Docker.Container;
  private hasExecuted?: boolean;

  private constructor() {
    this.dockerInstance = new Docker({
      host: process.env.DOCKER_API_IP,
      port: process.env.DOCKER_API_PORT,
      ca: process.env.CERTIFICAT_CA,
      cert: process.env.CERTIFICAT_CERT,
      key: process.env.CERTIFICAT_KEY,
      version: 'v1.41'
    });
    this.hasExecuted = undefined;
  }

  private async initialize(code: string, tests: string) {
    this.commonVolume = await this.dockerInstance.createVolume({
      Name: crypto.randomBytes(32).toString('hex'),
      Driver: 'local',
    });

    const promiseParse = this.dockerInstance.createContainer({
      Image: parseImage,
      Cmd: ['python', 'parserEasy.py', code, tests],
      HostConfig: {
        Binds: [this.commonVolume?.name + ':/volume/pcr'],
      },
    });

    const promiseCompile = this.dockerInstance.createContainer({
      Image: compileImage,
      HostConfig: {
        Binds: [this.commonVolume?.name + ':/volume/pcr'],
      },
      Tty: true,
    });

    const promiseExecute = this.dockerInstance.createContainer({
      Image: executeImage,
      HostConfig: {
        Binds: [this.commonVolume?.name + ':/volume/pcr'],
      },
      Tty: true,
    });

    [this.parseContainer, this.compileContainer, this.executeContainer] = await Promise.all([
      promiseParse,
      promiseCompile,
      promiseExecute,
    ]);
  }

  public static async create(code: string, tests: string) {
    const buildInstance = new BuildListener();
    await buildInstance.initialize(code, tests);
    return buildInstance;
  }

  public async build(): Promise<boolean> {
    await this.parseContainer?.start();

    await this.parseContainer?.wait();

    await this.compileContainer?.start();

    return (await this.compileContainer?.wait()).StatusCode === 1 ? false : true;
  }

  public async execute(timeout?: number) {
    await this.executeContainer?.start();
    if (timeout != null) {
      this.timeout(timeout).then(() => {
        if (this.hasExecuted === undefined) {
          this.executeContainer?.kill();
          this.hasExecuted = false;
        }
      });
    }
    await this.executeContainer?.wait();
    if (this.hasExecuted === undefined) {
      this.hasExecuted = true;
    }
  }

  public getCompileId() {
    return this.compileContainer?.id;
  }

  public getExecuteId() {
    return this.executeContainer?.id;
  }

  public async destroyDocker() {
    await Promise.all([
      this.parseContainer?.remove({ force: true }),
      this.compileContainer?.remove({ force: true }),
      this.executeContainer?.remove({ force: true }),
    ]);
    this.commonVolume?.remove();
  }

  public isExecuted() {
    return this.hasExecuted;
  }

  public async getStatus(): Promise<DockerTestResult> {
    let inspect = await this.executeContainer?.inspect();
    if (!inspect) {
      return DockerTestResult.ServerError;
    }
    return inspect.State.ExitCode as DockerTestResult;
  }

  private async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getCompileLink() {
    return `wss://${process.env.DOCKER_API_IP}:${process.env.DOCKER_API_PORT}/containers/${this.getCompileId()}/attach/ws?logs=1&stream=1&stdout=1&stderr=1`;
  }

  public getExecuteLink() {
    return `wss://${process.env.DOCKER_API_IP}:${process.env.DOCKER_API_PORT}/containers/${this.getExecuteId()}/attach/ws?logs=1&stream=1&stdout=1&stderr=1`;
  }
}
