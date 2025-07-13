resource "aws_iam_instance_profile" "instance-profile" {
  name = "yaswanth-profile"
  role = aws_iam_role.iam-role.name
}
