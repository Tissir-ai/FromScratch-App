import { DiagramType, FlowDiagram } from '@/types/diagram.type';

export interface DiagramTemplateMeta {
  id: string;
  name: string;
  description: string;
  type: DiagramType;
}

export interface DiagramTemplate extends DiagramTemplateMeta {
  createInstance: () => Omit<FlowDiagram, 'id' | 'title' | 'activeUsers'>;
}

const baseDiagram = (type: DiagramType) => ({
  type,
  nodes: [],
  edges: [],
});

// NOTE: These templates are inspired by existing mock diagrams
// but defined here explicitly so they do not depend on MockData.ts.

export const diagramTemplates: DiagramTemplate[] = [
  // CLASS diagrams
  {
    id: 'class-basic-domain',
    name: 'Basic Domain Model',
    description: 'Simple classes with associations for a small domain.',
    type: DiagramType.CLASS,
    createInstance: () => ({
      ...baseDiagram(DiagramType.CLASS),
      nodes: [
        {
          id: 'cls-user',
          type: 'classNode',
          position: { x: 100, y: 80 },
          data: {
            label: 'User',
            attributes: ['+ id: UUID', '+ email: string', '+ role: Role'],
            methods: ['+ register()', '+ authenticate()'],
          },
        },
        {
          id: 'cls-project',
          type: 'classNode',
          position: { x: 360, y: 80 },
          data: {
            label: 'Project',
            attributes: ['+ id: UUID', '+ name: string', '+ status: Status'],
            methods: ['+ addMember()', '+ archive()'],
          },
        },
        {
          id: 'cls-membership',
          type: 'classNode',
          position: { x: 230, y: 260 },
          data: {
            label: 'Membership',
            attributes: ['+ role: Role', '+ joinedAt: Date'],
            methods: ['+ changeRole()'],
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'cls-user',
          target: 'cls-membership',
          type: 'smoothstep',
          label: '1..*',
        },
        {
          id: 'e2',
          source: 'cls-project',
          target: 'cls-membership',
          type: 'smoothstep',
          label: '1..*',
        },
      ],
    }),
  },
  {
    id: 'class-layered-service',
    name: 'Layered Service',
    description: 'Entity, repository, and service classes in layers.',
    type: DiagramType.CLASS,
    createInstance: () => ({
      ...baseDiagram(DiagramType.CLASS),
      nodes: [
        {
          id: 'cls-entity',
          type: 'classNode',
          position: { x: 80, y: 80 },
          data: {
            label: 'Order',
            attributes: ['+ id: UUID', '+ total: Money', '+ status: Status'],
            methods: ['+ calculateTotal()', '+ markPaid()'],
          },
        },
        {
          id: 'cls-repo',
          type: 'classNode',
          position: { x: 320, y: 80 },
          data: {
            label: 'OrderRepository',
            attributes: ['- db: Database'],
            methods: ['+ findById(id)', '+ save(order)'],
          },
        },
        {
          id: 'cls-service',
          type: 'classNode',
          position: { x: 560, y: 80 },
          data: {
            label: 'OrderService',
            attributes: ['- repository: OrderRepository'],
            methods: ['+ placeOrder(cmd)', '+ cancelOrder(id)'],
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'cls-repo', target: 'cls-entity', type: 'smoothstep', label: 'persists' },
        { id: 'e2', source: 'cls-service', target: 'cls-repo', type: 'smoothstep', label: 'uses' },
      ],
    }),
  },
  {
    id: 'class-inheritance',
    name: 'Inheritance Hierarchy',
    description: 'Base class with two concrete implementations.',
    type: DiagramType.CLASS,
    createInstance: () => ({
      ...baseDiagram(DiagramType.CLASS),
      nodes: [
        {
          id: 'cls-base',
          type: 'classNode',
          position: { x: 260, y: 60 },
          data: {
            label: 'Notification',
            attributes: ['+ id: UUID', '+ createdAt: Date'],
            methods: ['+ send()'],
          },
        },
        {
          id: 'cls-email',
          type: 'classNode',
          position: { x: 80, y: 220 },
          data: {
            label: 'EmailNotification',
            attributes: ['+ email: string'],
            methods: ['+ send()'],
          },
        },
        {
          id: 'cls-sms',
          type: 'classNode',
          position: { x: 440, y: 220 },
          data: {
            label: 'SmsNotification',
            attributes: ['+ phone: string'],
            methods: ['+ send()'],
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'cls-email', target: 'cls-base', type: 'smoothstep', label: 'extends' },
        { id: 'e2', source: 'cls-sms', target: 'cls-base', type: 'smoothstep', label: 'extends' },
      ],
    }),
  },
  {
    id: 'class-aggregate',
    name: 'Aggregate Root',
    description: 'Aggregate root with child entities and value objects.',
    type: DiagramType.CLASS,
    createInstance: () => ({
      ...baseDiagram(DiagramType.CLASS),
      nodes: [
        {
          id: 'cls-cart',
          type: 'classNode',
          position: { x: 220, y: 80 },
          data: {
            label: 'Cart',
            attributes: ['+ id: UUID', '+ status: CartStatus'],
            methods: ['+ addItem()', '+ removeItem()', '+ checkout()'],
          },
        },
        {
          id: 'cls-item',
          type: 'classNode',
          position: { x: 60, y: 260 },
          data: {
            label: 'CartItem',
            attributes: ['+ productId: UUID', '+ quantity: number'],
            methods: ['+ changeQuantity()'],
          },
        },
        {
          id: 'cls-money',
          type: 'classNode',
          position: { x: 380, y: 260 },
          data: {
            label: 'Money',
            attributes: ['+ amount: number', '+ currency: string'],
            methods: [],
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'cls-cart', target: 'cls-item', type: 'smoothstep', label: '1..* items' },
        { id: 'e2', source: 'cls-cart', target: 'cls-money', type: 'smoothstep', label: 'total' },
      ],
    }),
  },

  // SEQUENCE diagrams
  {
    id: 'seq-request-response',
    name: 'Request / Response',
    description: 'Client calling API and receiving response.',
    type: DiagramType.SEQUENCE,
    createInstance: () => ({
      ...baseDiagram(DiagramType.SEQUENCE),
      nodes: [
        {
          id: 'client',
          type: 'sequenceLifeline',
          position: { x: 120, y: 40 },
          data: { label: 'Client' },
        },
        {
          id: 'api',
          type: 'sequenceLifeline',
          position: { x: 360, y: 40 },
          data: { label: 'API' },
        },
        {
          id: 'db',
          type: 'sequenceLifeline',
          position: { x: 600, y: 40 },
          data: { label: 'Database' },
        },
      ],
      edges: [
        {
          id: 'm1',
          source: 'client',
          target: 'api',
          sourceHandle: 'right-source-0',
          targetHandle: 'left-target-0',
          label: '1. sendRequest()',
          type: 'smoothstep',
        },
        {
          id: 'm2',
          source: 'api',
          target: 'db',
          sourceHandle: 'right-source-1',
          targetHandle: 'left-target-1',
          label: '2. query()',
          type: 'smoothstep',
        },
        {
          id: 'm3',
          source: 'db',
          target: 'api',
          sourceHandle: 'left-source-2',
          targetHandle: 'right-target-2',
          label: '3. result',
          type: 'smoothstep',
        },
        {
          id: 'm4',
          source: 'api',
          target: 'client',
          sourceHandle: 'left-source-3',
          targetHandle: 'right-target-3',
          label: '4. response',
          type: 'smoothstep',
        },
      ],
    }),
  },
  {
    id: 'seq-login-flow',
    name: 'User Login Flow',
    description: 'User authenticates via UI and auth service.',
    type: DiagramType.SEQUENCE,
    createInstance: () => ({
      ...baseDiagram(DiagramType.SEQUENCE),
      nodes: [
        { id: 'user', type: 'sequenceLifeline', position: { x: 80, y: 40 }, data: { label: 'User' } },
        { id: 'ui', type: 'sequenceLifeline', position: { x: 320, y: 40 }, data: { label: 'Web UI' } },
        { id: 'auth', type: 'sequenceLifeline', position: { x: 560, y: 40 }, data: { label: 'Auth Service' } },
      ],
      edges: [
        { id: 'm1', source: 'user', target: 'ui', sourceHandle: 'right-source-0', targetHandle: 'left-target-0', label: '1. enterCredentials()', type: 'smoothstep' },
        { id: 'm2', source: 'ui', target: 'auth', sourceHandle: 'right-source-1', targetHandle: 'left-target-1', label: '2. POST /login', type: 'smoothstep' },
        { id: 'm3', source: 'auth', target: 'ui', sourceHandle: 'left-source-2', targetHandle: 'right-target-2', label: '3. token + profile', type: 'smoothstep' },
        { id: 'm4', source: 'ui', target: 'user', sourceHandle: 'left-source-3', targetHandle: 'right-target-3', label: '4. redirect to dashboard', type: 'smoothstep' },
      ],
    }),
  },
  {
    id: 'seq-order-processing',
    name: 'Order Processing',
    description: 'Order service coordinating payment and stock.',
    type: DiagramType.SEQUENCE,
    createInstance: () => ({
      ...baseDiagram(DiagramType.SEQUENCE),
      nodes: [
        { id: 'shop', type: 'sequenceLifeline', position: { x: 60, y: 40 }, data: { label: 'Shop UI' } },
        { id: 'order', type: 'sequenceLifeline', position: { x: 280, y: 40 }, data: { label: 'Order Service' } },
        { id: 'stock', type: 'sequenceLifeline', position: { x: 500, y: 40 }, data: { label: 'Stock Service' } },
        { id: 'payment', type: 'sequenceLifeline', position: { x: 720, y: 40 }, data: { label: 'Payment Service' } },
      ],
      edges: [
        { id: 'm1', source: 'shop', target: 'order', sourceHandle: 'right-source-0', targetHandle: 'left-target-0', label: '1. placeOrder()', type: 'smoothstep' },
        { id: 'm2', source: 'order', target: 'stock', sourceHandle: 'right-source-1', targetHandle: 'left-target-1', label: '2. reserveStock()', type: 'smoothstep' },
        { id: 'm3', source: 'order', target: 'payment', sourceHandle: 'right-source-2', targetHandle: 'left-target-2', label: '3. charge()', type: 'smoothstep' },
        { id: 'm4', source: 'payment', target: 'order', sourceHandle: 'left-source-3', targetHandle: 'right-target-3', label: '4. paymentConfirmed', type: 'smoothstep' },
        { id: 'm5', source: 'order', target: 'shop', sourceHandle: 'left-source-4', targetHandle: 'right-target-4', label: '5. show confirmation', type: 'smoothstep' },
      ],
    }),
  },
  {
    id: 'seq-notifications',
    name: 'Notification Fan-out',
    description: 'Emit event and notify multiple channels.',
    type: DiagramType.SEQUENCE,
    createInstance: () => ({
      ...baseDiagram(DiagramType.SEQUENCE),
      nodes: [
        { id: 'domain', type: 'sequenceLifeline', position: { x: 80, y: 40 }, data: { label: 'Domain' } },
        { id: 'bus', type: 'sequenceLifeline', position: { x: 300, y: 40 }, data: { label: 'Event Bus' } },
        { id: 'email', type: 'sequenceLifeline', position: { x: 520, y: 40 }, data: { label: 'Email' } },
        { id: 'sms', type: 'sequenceLifeline', position: { x: 740, y: 40 }, data: { label: 'SMS' } },
      ],
      edges: [
        { id: 'm1', source: 'domain', target: 'bus', sourceHandle: 'right-source-0', targetHandle: 'left-target-0', label: '1. OrderCreated', type: 'smoothstep' },
        { id: 'm2', source: 'bus', target: 'email', sourceHandle: 'right-source-1', targetHandle: 'left-target-1', label: '2. send email', type: 'smoothstep' },
        { id: 'm3', source: 'bus', target: 'sms', sourceHandle: 'right-source-2', targetHandle: 'left-target-2', label: '3. send SMS', type: 'smoothstep' },
      ],
    }),
  },

  // USE-CASE diagrams
  {
    id: 'use-basic-auth',
    name: 'Authentication',
    description: 'User signs in and manages profile.',
    type: DiagramType.USE_CASE,
    createInstance: () => ({
      ...baseDiagram(DiagramType.USE_CASE),
      nodes: [
        { id: 'actor-user', type: 'actorNode', position: { x: 60, y: 120 }, data: { label: 'User' } },
        { id: 'uc-login', type: 'useCaseNode', position: { x: 260, y: 80 }, data: { label: 'Log in' } },
        { id: 'uc-manage', type: 'useCaseNode', position: { x: 260, y: 200 }, data: { label: 'Manage Profile' } },
      ],
      edges: [
        { id: 'e1', source: 'actor-user', target: 'uc-login', type: 'smoothstep' },
        { id: 'e2', source: 'actor-user', target: 'uc-manage', type: 'smoothstep' },
      ],
    }),
  },
  {
    id: 'use-ordering',
    name: 'Ordering',
    description: 'Customer browses catalog and places orders.',
    type: DiagramType.USE_CASE,
    createInstance: () => ({
      ...baseDiagram(DiagramType.USE_CASE),
      nodes: [
        { id: 'actor-customer', type: 'actorNode', position: { x: 60, y: 160 }, data: { label: 'Customer' } },
        { id: 'uc-browse', type: 'useCaseNode', position: { x: 260, y: 60 }, data: { label: 'Browse Catalog' } },
        { id: 'uc-add-cart', type: 'useCaseNode', position: { x: 260, y: 160 }, data: { label: 'Add to Cart' } },
        { id: 'uc-checkout', type: 'useCaseNode', position: { x: 260, y: 260 }, data: { label: 'Checkout' } },
      ],
      edges: [
        { id: 'e1', source: 'actor-customer', target: 'uc-browse', type: 'smoothstep' },
        { id: 'e2', source: 'actor-customer', target: 'uc-add-cart', type: 'smoothstep' },
        { id: 'e3', source: 'actor-customer', target: 'uc-checkout', type: 'smoothstep' },
      ],
    }),
  },
  {
    id: 'use-admin',
    name: 'Administration',
    description: 'Admin manages users and configuration.',
    type: DiagramType.USE_CASE,
    createInstance: () => ({
      ...baseDiagram(DiagramType.USE_CASE),
      nodes: [
        { id: 'actor-admin', type: 'actorNode', position: { x: 60, y: 160 }, data: { label: 'Admin' } },
        { id: 'uc-users', type: 'useCaseNode', position: { x: 260, y: 80 }, data: { label: 'Manage Users' } },
        { id: 'uc-config', type: 'useCaseNode', position: { x: 260, y: 220 }, data: { label: 'Configure System' } },
      ],
      edges: [
        { id: 'e1', source: 'actor-admin', target: 'uc-users', type: 'smoothstep' },
        { id: 'e2', source: 'actor-admin', target: 'uc-config', type: 'smoothstep' },
      ],
    }),
  },
  {
    id: 'use-support',
    name: 'Support & Feedback',
    description: 'User contacts support and leaves feedback.',
    type: DiagramType.USE_CASE,
    createInstance: () => ({
      ...baseDiagram(DiagramType.USE_CASE),
      nodes: [
        { id: 'actor-user2', type: 'actorNode', position: { x: 60, y: 160 }, data: { label: 'User' } },
        { id: 'uc-support', type: 'useCaseNode', position: { x: 260, y: 100 }, data: { label: 'Contact Support' } },
        { id: 'uc-feedback', type: 'useCaseNode', position: { x: 260, y: 220 }, data: { label: 'Leave Feedback' } },
      ],
      edges: [
        { id: 'e1', source: 'actor-user2', target: 'uc-support', type: 'smoothstep' },
        { id: 'e2', source: 'actor-user2', target: 'uc-feedback', type: 'smoothstep' },
      ],
    }),
  },

  // ACTIVITY diagrams
  {
    id: 'act-signup',
    name: 'User Sign-up',
    description: 'Steps from entering details to confirmation.',
    type: DiagramType.ACTIVITY,
    createInstance: () => ({
      ...baseDiagram(DiagramType.ACTIVITY),
      nodes: [
        { id: 'start', type: 'activityNode', position: { x: 120, y: 40 }, data: { label: 'Start' } },
        { id: 'form', type: 'activityNode', position: { x: 120, y: 140 }, data: { label: 'Fill Sign-up Form' } },
        { id: 'validate', type: 'activityNode', position: { x: 120, y: 240 }, data: { label: 'Validate Input' } },
        { id: 'email', type: 'activityNode', position: { x: 120, y: 340 }, data: { label: 'Send Confirmation Email' } },
        { id: 'done', type: 'activityNode', position: { x: 120, y: 440 }, data: { label: 'Account Activated' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'form', type: 'smoothstep' },
        { id: 'e2', source: 'form', target: 'validate', type: 'smoothstep' },
        { id: 'e3', source: 'validate', target: 'email', type: 'smoothstep', label: 'valid' },
        { id: 'e4', source: 'email', target: 'done', type: 'smoothstep' },
      ],
    }),
  },
  {
    id: 'act-checkout',
    name: 'Checkout Flow',
    description: 'From cart review to order confirmation.',
    type: DiagramType.ACTIVITY,
    createInstance: () => ({
      ...baseDiagram(DiagramType.ACTIVITY),
      nodes: [
        { id: 'a-cart', type: 'activityNode', position: { x: 120, y: 40 }, data: { label: 'Review Cart' } },
        { id: 'a-shipping', type: 'activityNode', position: { x: 120, y: 160 }, data: { label: 'Enter Shipping' } },
        { id: 'a-payment', type: 'activityNode', position: { x: 120, y: 280 }, data: { label: 'Enter Payment' } },
        { id: 'a-confirm', type: 'activityNode', position: { x: 120, y: 400 }, data: { label: 'Confirm Order' } },
      ],
      edges: [
        { id: 'e1', source: 'a-cart', target: 'a-shipping', type: 'smoothstep' },
        { id: 'e2', source: 'a-shipping', target: 'a-payment', type: 'smoothstep' },
        { id: 'e3', source: 'a-payment', target: 'a-confirm', type: 'smoothstep' },
      ],
    }),
  },
  {
    id: 'act-onboarding',
    name: 'Team Onboarding',
    description: 'Invite, accept, and assign roles.',
    type: DiagramType.ACTIVITY,
    createInstance: () => ({
      ...baseDiagram(DiagramType.ACTIVITY),
      nodes: [
        { id: 'a-invite', type: 'activityNode', position: { x: 120, y: 40 }, data: { label: 'Invite Member' } },
        { id: 'a-accept', type: 'activityNode', position: { x: 120, y: 160 }, data: { label: 'Accept Invitation' } },
        { id: 'a-assign', type: 'activityNode', position: { x: 120, y: 280 }, data: { label: 'Assign Role' } },
        { id: 'a-done', type: 'activityNode', position: { x: 120, y: 400 }, data: { label: 'Onboarded' } },
      ],
      edges: [
        { id: 'e1', source: 'a-invite', target: 'a-accept', type: 'smoothstep' },
        { id: 'e2', source: 'a-accept', target: 'a-assign', type: 'smoothstep' },
        { id: 'e3', source: 'a-assign', target: 'a-done', type: 'smoothstep' },
      ],
    }),
  },
  {
    id: 'act-incident',
    name: 'Incident Handling',
    description: 'Log, triage, fix, and close incident.',
    type: DiagramType.ACTIVITY,
    createInstance: () => ({
      ...baseDiagram(DiagramType.ACTIVITY),
      nodes: [
        { id: 'a-log', type: 'activityNode', position: { x: 120, y: 40 }, data: { label: 'Log Incident' } },
        { id: 'a-triage', type: 'activityNode', position: { x: 120, y: 160 }, data: { label: 'Triage' } },
        { id: 'a-fix', type: 'activityNode', position: { x: 120, y: 280 }, data: { label: 'Apply Fix' } },
        { id: 'a-verify', type: 'activityNode', position: { x: 120, y: 400 }, data: { label: 'Verify & Close' } },
      ],
      edges: [
        { id: 'e1', source: 'a-log', target: 'a-triage', type: 'smoothstep' },
        { id: 'e2', source: 'a-triage', target: 'a-fix', type: 'smoothstep' },
        { id: 'e3', source: 'a-fix', target: 'a-verify', type: 'smoothstep' },
      ],
    }),
  },
];

export const filterTemplates = (query: string, typeFilter?: DiagramType | 'all'): DiagramTemplate[] => {
  const normalizedQuery = query.trim().toLowerCase();
  return diagramTemplates.filter((tpl) => {
    if (typeFilter && typeFilter !== 'all' && tpl.type !== typeFilter) return false;
    if (!normalizedQuery) return true;
    const haystack = `${tpl.name} ${tpl.description}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
};
