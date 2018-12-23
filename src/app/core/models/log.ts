import { Device } from './device';
import { LogMap } from './log-map';
import { UserDetails } from './user-details';

export class Log {
  org_name: string;
  app_name: string;
  session_id: string;
  severity: string;
  calling_entity: string;
  user_details: UserDetails;
  device: Device;
  date_time: string;
  log_map: LogMap;
  stack_trace: string;

  constructor(org_name: string, app_name: string, calling_entity: string,
    device: Device) {
    this.org_name = org_name;
    this.app_name = app_name;
    this.calling_entity = calling_entity;
    this.device = device;
  }

}
