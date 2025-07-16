export default interface  Notification {
  id: number;
  text: string;
  time: string;
};

export default interface  Employee  {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  status: 'Activo' | 'Licencia';
};

export default interface  OrgNode {
  name: string;
  position: string;
  children?: OrgNode[];
};

