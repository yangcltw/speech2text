declare module 'ws' {
    import { EventEmitter } from 'events';
    
    namespace WebSocket {
      export interface ClientOptions {
        protocol?: string;
        handshakeTimeout?: number;
        perMessageDeflate?: boolean | object;
        maxPayload?: number;
      }
  
      export type RawData = Buffer | ArrayBuffer | Buffer[];
    }
  
    class WebSocket extends EventEmitter {
      static readonly CONNECTING: number;
      static readonly OPEN: number;
      static readonly CLOSING: number;
      static readonly CLOSED: number;
  
      readyState: number;
      
      constructor(address: string, options?: WebSocket.ClientOptions);
      
      close(): void;
      send(data: string | Buffer): void;
      
      on(event: 'open', listener: () => void): this;
      on(event: 'message', listener: (data: WebSocket.RawData) => void): this;
      on(event: 'error', listener: (error: Error) => void): this;
      on(event: 'close', listener: () => void): this;
      
      once(event: 'open', listener: () => void): this;
      once(event: 'message', listener: (data: WebSocket.RawData) => void): this;
      once(event: 'error', listener: (error: Error) => void): this;
      once(event: 'close', listener: () => void): this;
    }
  
    export = WebSocket;
  }