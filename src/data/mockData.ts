import { User, Activity, Position, Registration, CheckinRecord, WorkHour, Certificate } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'organizer1',
    name: '张组织者',
    role: 'organizer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=organizer',
    skills: ['项目管理', '活动策划', '急救培训'],
    volunteerHours: 0,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-002',
    username: 'manager1',
    name: '李负责人',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
    skills: ['团队协作', '沟通协调', '急救培训'],
    volunteerHours: 120,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'user-003',
    username: 'volunteer1',
    name: '王小明',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    skills: ['电脑办公', '文案撰写', '摄影'],
    volunteerHours: 48,
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'user-004',
    username: 'volunteer2',
    name: '陈小红',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
    skills: ['急救培训', '护理知识', '沟通协调'],
    volunteerHours: 96,
    createdAt: '2024-02-10T00:00:00Z'
  },
  {
    id: 'user-005',
    username: 'volunteer3',
    name: '刘小军',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu',
    skills: ['电脑办公', '摄影', '视频剪辑'],
    volunteerHours: 32,
    createdAt: '2024-03-01T00:00:00Z'
  },
  {
    id: 'user-006',
    username: 'volunteer4',
    name: '赵小敏',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
    skills: ['文案撰写', '设计', '摄影'],
    volunteerHours: 72,
    createdAt: '2024-03-15T00:00:00Z'
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'act-001',
    title: '城市公园环境保护志愿服务',
    description: '参与城市公园的环境保护活动，包括垃圾清理、绿化维护、环保知识宣传等。',
    coverImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a75836w=800&h=400&fit=crop',
    location: '城市中央公园',
    startTime: '2024-06-15T08:00:00Z',
    endTime: '2024-06-15T16:00:00Z',
    status: 'recruiting',
    organizerId: 'user-001',
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-10T00:00:00Z'
  },
  {
    id: 'act-002',
    title: '敬老院探访陪伴活动',
    description: '前往敬老院探望老人，提供陪伴聊天、文艺表演、健康义诊等服务。',
    coverImage: 'https://images.unsplash.com/photo-1516307365426-be393984f70b1?w=800&h=400&fit=crop',
    location: '阳光敬老院',
    startTime: '2024-06-22T09:00:00Z',
    endTime: '2024-06-22T17:00:00Z',
    status: 'recruiting',
    organizerId: 'user-001',
    createdAt: '2024-05-05T00:00:00Z',
    updatedAt: '2024-05-12T00:00:00Z'
  },
  {
    id: 'act-003',
    title: '社区图书馆志愿服务',
    description: '协助社区图书馆进行图书整理、读者服务、阅读推广等工作。',
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=400&fit=crop',
    location: '幸福社区图书馆',
    startTime: '2024-05-20T08:30:00Z',
    endTime: '2024-05-20T17:30:00Z',
    status: 'ended',
    organizerId: 'user-001',
    createdAt: '2024-04-15T00:00:00Z',
    updatedAt: '2024-05-20T18:00:00Z'
  },
  {
    id: 'act-004',
    title: '马拉松赛事志愿服务',
    description: '为城市马拉松赛事提供志愿服务，包括赛道指引、补给站服务、医疗协助等。',
    coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&h=400&fit=crop',
    location: '城市体育中心',
    startTime: '2024-07-01T06:00:00Z',
    endTime: '2024-07-01T14:00:00Z',
    status: 'recruiting',
    organizerId: 'user-001',
    createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z'
  },
  {
    id: 'act-005',
    title: '儿童福利院爱心助学活动',
    description: '前往儿童福利院开展爱心活动，陪伴孩子们游戏、辅导功课、组织活动等。',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
    location: '天使儿童福利院',
    startTime: '2024-06-29T09:00:00Z',
    endTime: '2024-06-29T16:00:00Z',
    status: 'recruiting',
    organizerId: 'user-001',
    createdAt: '2024-05-20T00:00:00Z',
    updatedAt: '2024-05-22T00:00:00Z'
  }
];

export const mockPositions: Position[] = [
  {
    id: 'pos-001',
    activityId: 'act-001',
    name: '环保宣传员',
    description: '负责环保知识宣传，发放宣传资料，解答市民咨询',
    totalQuota: 3,
    requirements: ['沟通协调', '文案撰写'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-002',
    activityId: 'act-001',
    name: '清洁志愿者',
    description: '负责公园内垃圾清理，绿化维护',
    totalQuota: 8,
    requirements: [],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-003',
    activityId: 'act-001',
    name: '摄影记录',
    description: '活动现场摄影摄像，记录精彩瞬间',
    totalQuota: 2,
    requirements: ['摄影'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-004',
    activityId: 'act-002',
    name: '陪伴志愿者',
    description: '陪伴老人聊天、下棋、读报纸',
    totalQuota: 10,
    requirements: [],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-005',
    activityId: 'act-002',
    name: '文艺表演',
    description: '为老人表演文艺节目',
    totalQuota: 5,
    requirements: ['沟通协调'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-006',
    activityId: 'act-002',
    name: '医护协助',
    description: '协助医护人员进行简单检查',
    totalQuota: 3,
    requirements: ['急救培训', '护理知识'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-007',
    activityId: 'act-003',
    name: '图书整理',
    description: '图书分类、上架、整理',
    totalQuota: 4,
    requirements: ['电脑办公'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-008',
    activityId: 'act-003',
    name: '读者服务',
    description: '读者咨询、借还书服务',
    totalQuota: 4,
    requirements: ['沟通协调'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-009',
    activityId: 'act-004',
    name: '赛道志愿者',
    description: '赛道指引、秩序维护',
    totalQuota: 20,
    requirements: [],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-010',
    activityId: 'act-004',
    name: '补给站服务',
    description: '补给站物资分发',
    totalQuota: 10,
    requirements: [],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-011',
    activityId: 'act-004',
    name: '医疗协助',
    description: '医疗点协助工作',
    totalQuota: 5,
    requirements: ['急救培训', '护理知识'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-012',
    activityId: 'act-005',
    name: '活动组织者',
    description: '组织游戏活动',
    totalQuota: 4,
    requirements: ['沟通协调'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-013',
    activityId: 'act-005',
    name: '课业辅导',
    description: '辅导孩子们功课',
    totalQuota: 6,
    requirements: ['电脑办公'],
    responsibleId: 'user-002'
  },
  {
    id: 'pos-014',
    activityId: 'act-005',
    name: '摄影记录',
    description: '活动摄影记录',
    totalQuota: 2,
    requirements: ['摄影'],
    responsibleId: 'user-002'
  }
];

export const mockRegistrations: Registration[] = [
  {
    id: 'reg-001',
    userId: 'user-003',
    activityId: 'act-001',
    positionId: 'pos-002',
    status: 'confirmed',
    waitlistOrder: null,
    signUpTime: '2024-05-10T10:00:00Z',
    confirmedTime: '2024-05-11T09:00:00Z'
  },
  {
    id: 'reg-002',
    userId: 'user-004',
    activityId: 'act-001',
    positionId: 'pos-006',
    status: 'confirmed',
    waitlistOrder: null,
    signUpTime: '2024-05-11T14:00:00Z',
    confirmedTime: '2024-05-12T09:00:00Z'
  },
  {
    id: 'reg-003',
    userId: 'user-005',
    activityId: 'act-001',
    positionId: 'pos-003',
    status: 'waitlist',
    waitlistOrder: 1,
    signUpTime: '2024-05-12T16:00:00Z',
    confirmedTime: null
  },
  {
    id: 'reg-004',
    userId: 'user-006',
    activityId: 'act-001',
    positionId: 'pos-001',
    status: 'confirmed',
    waitlistOrder: null,
    signUpTime: '2024-05-08T11:00:00Z',
    confirmedTime: '2024-05-09T09:00:00Z'
  },
  {
    id: 'reg-005',
    userId: 'user-003',
    activityId: 'act-003',
    positionId: 'pos-007',
    status: 'confirmed',
    waitlistOrder: null,
    signUpTime: '2024-04-20T10:00:00Z',
    confirmedTime: '2024-04-21T09:00:00Z'
  },
  {
    id: 'reg-006',
    userId: 'user-004',
    activityId: 'act-003',
    positionId: 'pos-008',
    status: 'confirmed',
    waitlistOrder: null,
    signUpTime: '2024-04-22T14:00:00Z',
    confirmedTime: '2024-04-23T09:00:00Z'
  },
  {
    id: 'reg-007',
    userId: 'user-005',
    activityId: 'act-002',
    positionId: 'pos-004',
    status: 'pending',
    waitlistOrder: null,
    signUpTime: '2024-05-20T10:00:00Z',
    confirmedTime: null
  },
  {
    id: 'reg-008',
    userId: 'user-006',
    activityId: 'act-002',
    positionId: 'pos-005',
    status: 'confirmed',
    waitlistOrder: null,
    signUpTime: '2024-05-18T09:00:00Z',
    confirmedTime: '2024-05-19T10:00:00Z'
  }
];

export const mockCheckins: CheckinRecord[] = [
  {
    id: 'chk-001',
    registrationId: 'reg-005',
    userId: 'user-003',
    checkinTime: '2024-05-20T08:30:00Z',
    checkoutTime: '2024-05-20T17:30:00Z',
    status: 'checked_out'
  },
  {
    id: 'chk-002',
    registrationId: 'reg-006',
    userId: 'user-004',
    checkinTime: '2024-05-20T08:45:00Z',
    checkoutTime: '2024-05-20T17:15:00Z',
    status: 'checked_out'
  }
];

export const mockWorkHours: WorkHour[] = [
  {
    id: 'wh-001',
    registrationId: 'reg-005',
    userId: 'user-003',
    activityId: 'act-003',
    hours: 8,
    status: 'approved',
    reviewerId: 'user-001',
    rejectReason: null,
    submittedAt: '2024-05-21T09:00:00Z',
    reviewedAt: '2024-05-22T10:00:00Z'
  },
  {
    id: 'wh-002',
    registrationId: 'reg-006',
    userId: 'user-004',
    activityId: 'act-003',
    hours: 7.5,
    status: 'approved',
    reviewerId: 'user-001',
    rejectReason: null,
    submittedAt: '2024-05-21T10:00:00Z',
    reviewedAt: '2024-05-22T10:30:00Z'
  },
  {
    id: 'wh-003',
    registrationId: 'reg-001',
    userId: 'user-003',
    activityId: 'act-001',
    hours: 5.5,
    status: 'rejected',
    reviewerId: 'user-002',
    rejectReason: '服务时长与签到记录不符，请核实后重新提交',
    submittedAt: '2024-06-16T10:00:00Z',
    reviewedAt: '2024-06-17T09:00:00Z',
    remarks: '清洁志愿者服务'
  },
  {
    id: 'wh-004',
    registrationId: 'reg-001',
    userId: 'user-003',
    activityId: 'act-001',
    hours: 6,
    status: 'draft',
    reviewerId: null,
    rejectReason: null,
    submittedAt: null,
    reviewedAt: null,
    remarks: '清洁志愿者服务草稿'
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert-001',
    certificateNo: 'VOL-2024-000001',
    userId: 'user-003',
    workHourId: 'wh-001',
    activityId: 'act-003',
    hours: 8,
    issueDate: '2024-05-22T10:00:00Z',
    status: 'valid',
    issuerId: 'user-001'
  },
  {
    id: 'cert-002',
    certificateNo: 'VOL-2024-000002',
    userId: 'user-004',
    workHourId: 'wh-002',
    activityId: 'act-003',
    hours: 7.5,
    issueDate: '2024-05-22T10:30:00Z',
    status: 'valid',
    issuerId: 'user-001'
  }
];
