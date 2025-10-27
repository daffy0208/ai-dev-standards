import { z } from 'zod'

const testbuttonPropsSchema = z.object({
  label: z.string(),
  onClick: z.function().args(z.any()).returns(z.void()).optional(),
})

export type TestbuttonProps = z.infer<typeof testbuttonPropsSchema>

export function Testbutton(props: TestbuttonProps) {
  const validated = testbuttonPropsSchema.parse(props)

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Testbutton</h3>
      {/* Add your component implementation here */}
    </div>
  )
}
