import type { LEAD_STATUS } from '@stone-shop/shared';

export class LeadEntity {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly consent: boolean;
  readonly status: LEAD_STATUS;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    phone: string;
    consent: boolean;
    status: LEAD_STATUS;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.phone = props.phone;
    this.consent = props.consent;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromPersistence(raw: {
    id: string;
    name: string;
    phone: string;
    consent: boolean;
    status: LEAD_STATUS;
    createdAt: Date;
    updatedAt: Date;
  }): LeadEntity {
    return new LeadEntity({ ...raw });
  }
}
