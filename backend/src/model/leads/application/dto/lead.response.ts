import type { LeadStatus } from '@/generated/prisma';

export class LeadResponse {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly consent: boolean;
  readonly status: LeadStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    phone: string;
    consent: boolean;
    status: LeadStatus;
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
}
