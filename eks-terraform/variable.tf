variable "node_group_name" {
  description = "Name of the EKS node group"
  type        = string
  default     = "project-node-group"
}

variable "master_role_name_prefix" {
  description = "Prefix for the EKS master IAM role (random suffix appended by AWS)"
  type        = string
  default     = "yaswanth-eks-master-"
}

variable "worker_role_name_prefix" {
  description = "Prefix for the EKS worker IAM role (random suffix appended by AWS)"
  type        = string
  default     = "yaswanth-eks-worker-"
}

variable "worker_instance_profile_prefix" {
  description = "Prefix for the worker IAM instance profile (random suffix appended by AWS)"
  type        = string
  default     = "yaswanth-eks-worker-profile-"
}
