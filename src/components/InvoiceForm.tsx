'use client';

import Link from 'next/link';
import { Controller, useFieldArray, UseFormReturn } from 'react-hook-form';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Asterisk, Plus, X } from 'lucide-react';

interface InvoiceFormProps {
  form: UseFormReturn<InvoiceFormValues>;
  onSubmit: (data: InvoiceFormValues) => void;
}

export default function InvoiceForm({ form, onSubmit }: InvoiceFormProps) {
  const { fields, append, remove } = useFieldArray<InvoiceFormValues>({
    control: form.control,
    name: 'items'
  });

  const watchFromName = form.watch('fromName');
  const watchToName = form.watch('toName');

  return (
    <>
      <header className=''>
        <Link
          className='flex items-center justify-center size-11 bg-muted rounded-full'
          href='/'
          aria-label='Back to select a theme'
        >
          <ArrowLeft />
        </Link>
        <h2 className='text-7xl mt-12 mb-8'>New invoice</h2>
      </header>
      <form
        className='flex flex-col gap-y-6 w-full'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Accordion>
          <AccordionItem value='from'>
            <AccordionTrigger className='w-full'>
              <div>From</div>
              <div>{watchFromName || 'None'}</div>
            </AccordionTrigger>
            <AccordionContent>
              <FieldSet>
                <FieldLegend className='sr-only'>From</FieldLegend>
                <FieldGroup>
                  <Controller
                    name='fromName'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <>
                        <Field
                          orientation='horizontal'
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel htmlFor='fromName'>Name</FieldLabel>
                          <Input
                            id='fromName'
                            placeholder='John Seabass'
                            aria-invalid={fieldState.invalid}
                            {...field}
                          />
                          <span
                            data-slot='required'
                            className='flex items-center justify-center size-11'
                          >
                            <Asterisk />
                          </span>
                        </Field>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </>
                    )}
                  />
                  <Controller
                    name='fromEmail'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <>
                        <Field
                          orientation='horizontal'
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel htmlFor='fromEmail'>Email</FieldLabel>
                          <div className='flex items-center gap-x-2'>
                            <Input
                              id='fromEmail'
                              type='email'
                              placeholder='john@seabass.dev'
                              aria-invalid={fieldState.invalid}
                              {...field}
                            />
                            <span className='flex items-center justify-center size-11'>
                              <Asterisk />
                            </span>
                          </div>
                        </Field>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </>
                    )}
                  />
                  <Controller
                    name='fromAddress'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='fromAddress'>Address</FieldLabel>
                        <Input
                          id='fromAddress'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name='fromPhone'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='fromPhone'>Phone</FieldLabel>
                        <Input
                          id='fromPhone'
                          type='tel'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name='fromCity'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='fromCity'>City</FieldLabel>
                        <Input
                          id='fromCity'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name='fromPostcode'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='fromPostcode'>Postcode</FieldLabel>
                        <Input
                          id='fromPostcode'
                          placeholder='W1K 3JP'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name='fromCountry'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='fromCountry'>Country</FieldLabel>
                        <Input
                          id='fromCountry'
                          placeholder='United Kingdom'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='to'>
            <AccordionTrigger className='w-full'>
              <div>To</div>
              <div>{watchToName || 'None'}</div>
            </AccordionTrigger>
            <AccordionContent>
              <FieldSet>
                <FieldLegend className='sr-only'>From</FieldLegend>
                <FieldGroup>
                  <Controller
                    name='toName'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <>
                        <Field
                          orientation='horizontal'
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel htmlFor='toName'>Name</FieldLabel>
                          <div className='flex items-center gap-x-2'>
                            <Input
                              id='toName'
                              placeholder='John Seabass'
                              aria-invalid={fieldState.invalid}
                              {...field}
                            />
                            <span className='flex items-center justify-center size-11'>
                              <Asterisk />
                            </span>
                          </div>
                        </Field>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </>
                    )}
                  />
                  <Controller
                    name='toEmail'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <>
                        <Field
                          orientation='horizontal'
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel htmlFor='toEmail'>Email</FieldLabel>
                          <div className='flex items-center gap-x-2'>
                            <Input
                              id='toEmail'
                              type='email'
                              placeholder='john@seabass.dev'
                              aria-invalid={fieldState.invalid}
                              {...field}
                            />
                            <span className='flex items-center justify-center size-11'>
                              <Asterisk />
                            </span>
                          </div>
                        </Field>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </>
                    )}
                  />
                  <Controller
                    name='toAddress'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='toAddress'>Address</FieldLabel>
                        <Input
                          id='toAddress'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name='toPhone'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='toPhone'>Phone</FieldLabel>
                        <Input
                          id='toPhone'
                          type='tel'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name='toCity'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='toCity'>City</FieldLabel>
                        <Input
                          id='toCity'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name='toPostcode'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='toPostcode'>Postcode</FieldLabel>
                        <Input
                          id='toPostcode'
                          placeholder='W1K 3JP'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name='toCountry'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        orientation='horizontal'
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor='toCountry'>Country</FieldLabel>
                        <Input
                          id='toCountry'
                          placeholder='United Kingdom'
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <FieldSet>
          <FieldLegend className='sr-only'>Information</FieldLegend>
          <FieldGroup>
            <Controller
              name='invoiceNo'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation='horizontal'
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor='invoiceNo'>Invoice no.</FieldLabel>
                  <Input
                    id='invoiceNo'
                    placeholder='#100'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </Field>
              )}
            />
            <Controller
              name='issueDate'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation='horizontal'
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor='issueDate'>Issue date</FieldLabel>
                  <Input
                    id='issueDate'
                    type='date'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </Field>
              )}
            />
            <Controller
              name='dueDate'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation='horizontal'
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor='dueDate'>Due date</FieldLabel>
                  <Input
                    id='dueDate'
                    type='date'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className='sr-only'>Invoice items</FieldLegend>
          <FieldGroup>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className='flex items-center gap-x-3 pl-6 pr-2 bg-muted rounded-full'
              >
                <Controller
                  name={`items.${index}.qty`}
                  control={form.control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field
                      className='flex-[0_0_24px] w-6'
                      data-invalid={fieldState.invalid}
                    >
                      <Input
                        id={`items.${index}.qty`}
                        type='number'
                        placeholder='0'
                        aria-invalid={fieldState.invalid}
                        {...controllerField}
                      />
                    </Field>
                  )}
                />
                <div className='text-muted-foreground pr-2'>&times;</div>
                <Controller
                  name={`items.${index}.description`}
                  control={form.control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        id={`items.${index}.description`}
                        placeholder='Item'
                        aria-invalid={fieldState.invalid}
                        {...controllerField}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`items.${index}.amount`}
                  control={form.control}
                  render={({ field: controllerField, fieldState }) => (
                    <Field
                      className='max-w-fit'
                      data-invalid={fieldState.invalid}
                    >
                      <Input
                        id={`items.${index}.amount`}
                        className='text-right'
                        type='number'
                        placeholder='0.00'
                        step='0.01'
                        aria-invalid={fieldState.invalid}
                        {...controllerField}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <button
                  className='flex items-center justify-between h-15 text-xl text-muted-foreground bg-muted rounded-full cursor-pointer'
                  type='button'
                  aria-label={`Remove item ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <span className='flex items-center justify-center size-11 bg-white rounded-full'>
                    <X />
                  </span>
                </button>
              </div>
            ))}
            <div className='w-full pl-6 pr-2 text-muted-foreground bg-muted rounded-full'>
              <button
                className='flex w-full items-center justify-between h-15 text-xl cursor-pointer'
                type='button'
                onClick={() => append({ qty: 1, description: '', amount: '' })}
              >
                Add item
                <span className='flex items-center justify-center size-11 bg-white rounded-full'>
                  <Plus />
                </span>
              </button>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className='sr-only'>Tax</FieldLegend>
          <FieldGroup>
            <Controller
              name='tax'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation='horizontal'
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor='tax'>Tax</FieldLabel>
                  <Input
                    id='tax'
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className='sr-only'>Notes</FieldLegend>
          <FieldGroup>
            <Controller
              name='notes'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  className='items-start'
                  orientation='horizontal'
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel className='h-15' htmlFor='notes'>
                    Notes
                  </FieldLabel>
                  <div className='flex items-center gap-x-2'>
                    <Textarea
                      id='notes'
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <div className='sticky bottom-5 lg:bottom-10 flex justify-end'>
          <Button className='rounded-full' type='submit'>
            Create invoice
            <ArrowRight data-icon='inline-end' />
          </Button>
        </div>
      </form>
    </>
  );
}
