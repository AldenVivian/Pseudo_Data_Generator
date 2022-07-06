import configparser
import diagrams
import time
import re
import csv
from faker import Faker
import pandas as pd
import datetime
import shutil
import random
import numpy as np


fake = Faker()

config = configparser.ConfigParser()
config.sections()
config.read("C:/Users/alden/Desktop/samplecsv/rules.ini")
titanic_data = pd.read_csv(r'C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')
df = pd.DataFrame(columns=[titanic_data.head()])

colnames = []
lister = df.columns #list
colnames = df.columns
totcols = len(lister)
print(f"list {len(lister)}")
#dataframe.insert(loc, column, value, allow_duplicates)
print(config.sections())
lister = config.sections()
print(lister) # column names
length = len(config.sections())#number of columns
print(length)

print(f"titanic_data_head  {titanic_data.head()}")

records = int(config['rec']['num'])
choice = int(config['rec']['mode'])
i = 1

#original = r'C:\Users\alden\Desktop\samplecsv\f4.csv'#students.csv
#target = r'C:\Users\alden\Desktop\samplecsv\f5.csv'
#shutil.copyfile(original, target)


'''dataframes to append data to csv'''

'''while(records>0):
    df2 = pd.DataFrame([[fake.first_name(), fake.last_name(), fake.date(), fake.email()]],columns=[titanic_data.head()])
    df2.to_csv('C:/Users/alden/Desktop/samplecsv/students.csv', mode='a', index=False, header=False)
    print(f"df {df2}")
    records =records-1'''



def m1():
    columnnum =1
    temparr =[]
    lengther = 1
    count = 1
    while(count<=records):
        while(lengther <=totcols):# generating one row length-1
            print(temparr)
            if(config['c'+str(columnnum)]['data'] == "firstname"):
                    print("fname")
                    fname = fake.first_name()
                    temparr.append(fake.first_name())
                    lengther +=1
                    columnnum = columnnum+1

            elif(config['c'+str(columnnum)]['data'] == "lastname"):
                    print("lname")
                    lname = fake.last_name()
                    temparr.append(lname)
                    lengther += 1
                    columnnum = columnnum + 1

            elif (config['c' + str(columnnum)]['data'] == "company"):#company name
                print("company")
                compname = fake.company()
                temparr.append(compname)
                lengther += 1
                columnnum = columnnum + 1

            elif (config['c'+str(columnnum)]['data'] == "dob"):
                print("dob")
                dob = fake.date_between(start_date=str(config['c'+str(columnnum)]['start_date']), end_date=str(config['c'+str(columnnum)]['end_date']))
                t = dob
                dobfin = t.strftime('%m/%d/%Y')
                temparr.append(dobfin)
                lengther += 1
                columnnum = columnnum + 1

            elif (config['c'+str(columnnum)]['data'] == "email"):
                print("email")
                email = temparr[0]+lname+"@"+fake.free_email_domain()
                temparr.append(email)
                lengther += 1
                columnnum = columnnum + 1
            elif (config['c'+str(columnnum)]['data'] == "cgpa"):
                print("cgpa")
                cgpa= fake.pyfloat(left_digits=None, right_digits=2, positive=True, min_value=int(config['c'+str(columnnum)]['min_val']), max_value=int(config['c'+str(columnnum)]['max_val']));
                temparr.append(cgpa)
                lengther += 1
                columnnum = columnnum + 1
            elif (config['c'+str(columnnum)]['data'] == "weight"):
                print("weight")
                weight= fake.pyfloat(left_digits=None, right_digits=1, positive=True, min_value=int(config['c'+str(columnnum)]['min_val']), max_value=int(config['c'+str(columnnum)]['max_val']));
                temparr.append(weight)
                lengther += 1
                columnnum = columnnum + 1
            elif (config['c'+str(columnnum)]['data'] == "height"):
                print("height")
                height= fake.pyfloat(left_digits=None, right_digits=1, positive=True, min_value=int(config['c'+str(columnnum)]['min_val']), max_value=int(config['c'+str(columnnum)]['max_val']));
                temparr.append(height)
                lengther += 1
                columnnum = columnnum + 1
            elif (config['c' + str(columnnum)]['data'] == "reference_range"):#referencing another columns value with ranges(rep manager)
                print("region")
                reference_col = int(config['c' + str(columnnum)]['cols'])
                values = str(config['c' + str(columnnum)]['value']).split(',')
                ranges = (config['c' + str(columnnum)]['range']).split(',')

                for i in range(len(ranges)):
                    if (int(temparr[reference_col-1]) <= int(ranges[i])):
                        temp_disc = values[i]
                        temparr.append(temp_disc)
                        break
                    else:
                        continue

                lengther += 1
                columnnum = columnnum + 1

            elif (config['c' + str(columnnum)]['data'] == "reference_boolean"):  # referencing another columns value with boolean values(yes/no)
                print("region")
                reference_col = int(config['c' + str(columnnum)]['cols'])
                condition = str(config['c' + str(columnnum)]['condition'])
                options = str(config['c' + str(columnnum)]['value']).split(',')

                if(temparr[reference_col-1] == condition):
                    temparr.append(random.choice(options))
                else:
                    temparr.append(options[1])
                lengther += 1
                columnnum = columnnum + 1

            elif (config['c' + str(columnnum)]['data'] == "reference_boolean2"):  # referencing another columns value with boolean values(yes/no)
                print("region")
                reference_col = int(config['c' + str(columnnum)]['cols'])
                condition = str(config['c' + str(columnnum)]['condition'])
                options = str(config['c' + str(columnnum)]['value']).split(',')

                if (temparr[reference_col - 1] == condition):
                    temparr.append(random.choice(options))
                else:
                    temparr.append('0')
                lengther += 1
                columnnum = columnnum + 1

            elif (config['c' + str(columnnum)]['data'] == "reference"):  # referencing another columns value with exact/given values(product cost)
                print("unit cost")

                reference_col = int(config['c' + str(columnnum)]['cols'])
                values = str(config['c' + str(columnnum)]['value']).split(',')
                ranges = str(config['c' + str(columnnum)]['range']).split(',')

                for i in range(len(ranges)):
                    if (int(temparr[reference_col - 1]) == int(values[i])):
                        temp_disc = int(ranges[i])
                        print(temp_disc)
                        temparr.append(temp_disc)
                        break
                    else:
                        continue

                lengther += 1
                columnnum = columnnum + 1

            elif (config['c' + str(columnnum)]['data'] == "reference_range"):  # referencing another columns value with boolean values(range)
                print("region")
                reference_col = int(config['c' + str(columnnum)]['cols'])
                condition = str(config['c' + str(columnnum)]['cols'])
                options = str(config['c' + str(columnnum)]['value']).split(',')

                if (temparr[reference_col - 1] == int(condition)):
                    temparr.append(random.choice(options))
                else:
                    temparr.append(0)
                lengther += 1
                columnnum = columnnum + 1

            elif (config['c' + str(columnnum)]['data'] == "discount"):  # referencing another columns value with boolean values(range)
                print("caught")

                reference_col = int(config['c' + str(columnnum)]['cols'])
                value = int(config['c' + str(columnnum)]['value'])
                operation = str(config['c' + str(columnnum)]['operation'])
                print(operation)
                print(columnnum)
                print(lengther)
                if (operation == "-"):
                    temp_val = float(temparr[reference_col-1])
                    temp_fin = (temp_val)-((temp_val*value)/100)
                    temparr.append(temp_fin)


                elif (operation == "+"):
                    temp_val = float(temparr[reference_col-1])
                    temp_fin = (temp_val)+((temp_val*value)/100)
                    temparr.append(temp_fin)


                lengther += 1
                columnnum = columnnum + 1
                print("done")

            elif (config['c' + str(columnnum)]['data'] == "total"):
                print("total")
                operator = str(config['c' + str(columnnum)]['operation'])
                temps = str(config['c' + str(columnnum)]['operands'])

                ops = temps.split(',')
                arr = ops
                print()
                #templen = len(ops)
                #add if statements for all operands


                total = 0.0;
                if(operator == "+"):
                    for item in ops:
                        print(item)
                        element = lister.index(item)
                        print(f"element {element}")

                        eltemp = float(temparr[element-1])
                        total += eltemp
                    temparr.append(total)
                    print(total)
                    lengther += 1
                    columnnum = columnnum + 1

                elif(operator =="*"):
                    total = 1
                    for item in ops:
                        print(item)
                        element = lister.index(item)
                        print(f"element {element}")

                        eltemp = float(temparr[element - 2])
                        total = eltemp*total
                    temparr.append(total)
                    print(total)
                    lengther += 1
                    columnnum = columnnum + 1

                elif (operator == "/"):
                    total = 1
                    for item in ops:
                        print(item)
                        element = lister.index(item)
                        print(f"element {element}")

                        eltemp = float(temparr[element - 1])
                        total = eltemp/total
                    temparr.append(total)
                    print(total)
                    lengther += 1
                    columnnum = columnnum + 1

                elif (operator == "-"):
                    for item in ops:
                        print(item)
                        element = lister.index(item)
                        print(f"element {element}")

                        eltemp = float(temparr[element - 1])
                        total = eltemp - total
                    temparr.append(total)
                    print(total)
                    lengther += 1
                    columnnum = columnnum + 1

            elif(config['c' + str(columnnum)]['data'] == "random"):
                section_str = 'c' + str(columnnum)
                if(config.has_option(section_str,'weights')):
                    print("random2")
                    randarr = (config['c' + str(columnnum)]['options']).split(',')
                    strrand_w = (config['c' + str(columnnum)]['weights']).split(',')
                    rand_w = []
                    for itm in strrand_w:
                        tempitm = int(itm)
                        rand_w.append(tempitm)
                    print(randarr)
                    temp_rand = random.choices(randarr, weights=rand_w)
                    str_temp_rand = "".join(temp_rand)
                    temparr.append(str_temp_rand)
                    lengther += 1
                    columnnum = columnnum + 1
                else:

                    print("random1")
                    randarr = (config['c' + str(columnnum)]['options']).split(',')
                    print(randarr)
                    temp_rand = random.choice(randarr)
                    temparr.append(temp_rand)
                    lengther += 1
                    columnnum = columnnum + 1
            elif (config['c' + str(columnnum)]['data'] == "increment"):
                temp_read = pd.read_csv("C:/Users/alden/Desktop/samplecsv/salesfunnel.csv")
                if(temp_read.empty):
                    '''interval = int(config['c' + str(columnnum)]['interval'])
                    last_row = temp_read.iloc[-1].tolist()
                    temp_col = int(columnnum)
                    prev_num = last_row[temp_col - 1]'''
                    curr_num = 1
                    print(curr_num)
                    temparr.append(curr_num)
                    lengther += 1
                    columnnum = columnnum + 1

                else:
                    interval = int(config['c' + str(columnnum)]['interval'])
                    last_row = temp_read.iloc[-1].tolist()
                    temp_col = int(columnnum)
                    prev_num = last_row[temp_col - 1]
                    curr_num = int(prev_num) + int(interval)
                    print(curr_num)
                    temparr.append(curr_num)
                    lengther += 1
                    columnnum = columnnum + 1

        print(len(temparr))
        df2 = pd.DataFrame([temparr], columns=[titanic_data.head()])
        df2.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', mode='a', index=False, header=False)
        temparr.clear()
        print(f"df {df2}")
        del df2
        lengther = 1
        count = count+1
        columnnum = 1

def m2():#appending
    columnnum2 = 1;
    if(config['a' + str(columnnum2)]['operation'] == "concate"):
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')
        print("mode 2 concate")

        records = dftemp.shape[0]
        if records == 0:
            records = int(config['rec']['num'])
        temp_col = str(config['a'+str(columnnum2)]['cols'])
        cols = temp_col.split(',')
        print(cols)
        new_list = []
        incr = 0
        while (records > 0):
            temp_row = dftemp.iloc[incr].tolist()
            college = temp_row[int(cols[0])-1]
            abrv = str(college[0:3])
            unique = str(temp_row[int(cols[1])-1])

            generate = abrv + unique
            new_list.append(generate)
            incr = incr + 1
            records = records - 1

        print(new_list)
        column_name = str(config['a'+str(columnnum2)]['new_col'])

        data_new1 = dftemp.assign(new_col=new_list)
        data_new1.rename(columns={'new_col': column_name}, inplace=True)
        print(data_new1)
        columnnum2 = columnnum2 + 1

        data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
    elif(config['a' + str(columnnum2)]['operation'] == "generate"):
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')
        print("mode 2 generate")
        records = dftemp.shape[0]  #number of records to generate
        new_list = []
        incr = 0
        while(records>0):
            randarr = (config['a' + str(columnnum2)]['options']).split(',')
            strrand_w = (config['a' + str(columnnum2)]['weights']).split(',')
            rand_w = []
            for itm in strrand_w:
                tempitm = int(itm)
                rand_w.append(tempitm)

            print(randarr)
            temp_rand = random.choices(randarr, weights=rand_w)
            str_temp_rand = "".join(temp_rand)
            new_list.append(str_temp_rand)
            records = records-1
        column_name = str(config['a'+str(columnnum2)]['new_col'])

        data_new1 = dftemp.assign(new_col=new_list)
        data_new1.rename(columns={'new_col': column_name}, inplace=True)
        print(data_new1)
        data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
        columnnum2 = columnnum2 + 1
    elif (config['a' + str(columnnum2)]['operation'] == "calculation2"):
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')
        print("mode 2 generate")
        records = dftemp.shape[0]  # number of records to generate
        new_list = []
        incr = 0
        A = (config['a' + str(columnnum2)]['cols']).split(',')
        cols = np.array(A)
        cols = cols.astype(int)
        value_str = str(config['a' + str(columnnum2)]['value'])
        value = float(value_str)
        print(f"value {value}")

        operanddisc = str(config['a' + str(columnnum2)]['operand'])
        if(operanddisc == 'x'):
            while (records > 0):
                temp_row = dftemp.iloc[incr].tolist()
                total = 1
                for i in range(len(cols)):
                    total = total*(temp_row[cols[i]-1])

                #print(temp_row)
                temp_disc = total
                new_list.append(temp_disc)
                records = records-1
                incr = incr+1
            column_name = str(config['a' + str(columnnum2)]['new_col'])
            data_new1 = dftemp.assign(new_col=new_list)
            data_new1.rename(columns={'new_col': column_name}, inplace=True)
            print(data_new1)
            data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
            columnnum2 = columnnum2 + 1
        elif(operanddisc == '+'):
            while (records > 0):
                temp_row = dftemp.iloc[incr].tolist()
                total = 1
                for i in range(len(cols)):
                    total = total + (temp_row[cols[i] - 1])

                # print(temp_row)
                temp_disc = total
                new_list.append(temp_disc)
                records = records - 1
                incr = incr + 1
            column_name = str(config['a' + str(columnnum2)]['new_col'])
            data_new1 = dftemp.assign(new_col=new_list)
            data_new1.rename(columns={'new_col': column_name}, inplace=True)
            print(data_new1)
            data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
            columnnum2 = columnnum2 + 1
        elif (operanddisc == '-'):
            while (records > 0):
                temp_row = dftemp.iloc[incr].tolist()
                total = 1
                for i in range(len(cols)):
                    total = total - (temp_row[cols[i] - 1])

                # print(temp_row)
                temp_disc = total
                new_list.append(temp_disc)
                records = records - 1
                incr = incr + 1
            column_name = str(config['a' + str(columnnum2)]['new_col'])
            data_new1 = dftemp.assign(new_col=new_list)
            data_new1.rename(columns={'new_col': column_name}, inplace=True)
            print(data_new1)
            data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
            columnnum2 = columnnum2 + 1

        elif (operanddisc == '/'):
            while (records > 0):
                temp_row = dftemp.iloc[incr].tolist()
                total = 1
                for i in range(len(cols)):
                    total = total - (temp_row[cols[i] - 1])

                # print(temp_row)
                temp_disc = total
                new_list.append(temp_disc)
                records = records - 1
                incr = incr + 1
            column_name = str(config['a' + str(columnnum2)]['new_col'])
            data_new1 = dftemp.assign(new_col=new_list)
            data_new1.rename(columns={'new_col': column_name}, inplace=True)
            print(data_new1)
            data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
            columnnum2 = columnnum2 + 1

    elif (config['a' + str(columnnum2)]['operation'] == "calculation"):
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')
        print("mode 2 generate")
        records = dftemp.shape[0]  # number of records to generate
        new_list = []
        incr = 0
        cols = int(config['a' + str(columnnum2)]['cols'])
        value_str = str(config['a' + str(columnnum2)]['value'])
        value = float(value_str)
        print(f"value {value}")
        operanddisc = str(config['a' + str(columnnum2)]['operand'])
        if(operanddisc == '-'):
            while (records > 0):
                temp_row = dftemp.iloc[incr].tolist()

                #print(temp_row)
                price = temp_row[cols- 1]
                print(price)
                temp_disc = price-((price*value)/100)
                new_list.append(temp_disc)
                records = records-1
                incr = incr+1
            column_name = str(config['a' + str(columnnum2)]['new_col'])
            data_new1 = dftemp.assign(new_col=new_list)
            data_new1.rename(columns={'new_col': column_name}, inplace=True)
            print(data_new1)
            data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
            columnnum2 = columnnum2 + 1
        elif(operanddisc == '+'):
            while (records > 0):
                temp_row = dftemp.iloc[incr].tolist()

                # print(temp_row)
                price = temp_row[cols - 1]
                print(price)
                temp_disc = price + ((price * value) / 100)
                new_list.append(temp_disc)
                records = records - 1
                incr = incr + 1

            column_name = str(config['a' + str(columnnum2)]['new_col'])
            data_new1 = dftemp.assign(new_col=new_list)
            data_new1.rename(columns={'new_col': column_name}, inplace=True)
            print(data_new1)
            data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
            columnnum2 = columnnum2 + 1

    elif (config['a' + str(columnnum2)]['operation'] == "replace"):
        print("replace mode")
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')


        replace = (config['a' + str(columnnum2)]['replace'])
        find = (config['a' + str(columnnum2)]['find'])
        colname = (config['a' + str(columnnum2)]['col_name'])
        print(colname)
        #dftemp[colname] = dftemp[colname].replace([find], replace)
        dftemp[colname] = dftemp[colname].replace(find,replace)

        dftemp.to_csv("C:/Users/alden/Desktop/samplecsv/salesfunnel.csv", index=False)

        '''df.to_csv("AllDetails.csv", index=False)
        df = pd.DataFrame(dftemp, columns=['subjects'])
        df['subjects'] = df['subjects'].replace(['biology'], 'bio')
        df.to_csv("C:/Users/alden/Desktop/samplecsv/studentsuniquetest2.csv", index=False)'''
        print(dftemp)
        columnnum2 = columnnum2+1
    elif (config['a' + str(columnnum2)]['operation'] == "generate2"):#### name generate
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')
        print("mode 2 generate")
        records = dftemp.shape[0]  # number of records to generate

        if records == 0:
            records = int(config['rec']['num'])

        new_list = []
        incr = 0
        rand_w = []
        while (records > 0):
            #randarr = (config['a' + str(columnnum2)]['options']).split(',')
            #strrand_w = (config['a' + str(columnnum2)]['weights']).split(',')


            rand_w.append(fake.first_name())




            #new_list.append(rand_w)
            records = records - 1

        column_name = str(config['a' + str(columnnum2)]['new_col'])
        print(rand_w)
        data_new1 = dftemp.assign(new_col=rand_w)
        data_new1.rename(columns={'new_col': column_name}, inplace=True)
        print(data_new1)
        data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
        columnnum2 = columnnum2 + 1

    elif (config['a' + str(columnnum2)]['operation'] == "reference"):#reference and insert data
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')

        print("mode 2 generate calculation2")
        records = dftemp.shape[0]  # number of records to generate
        new_list = []
        incr = 0
        cols = int(config['a' + str(columnnum2)]['cols'])
        value_str = str(config['a' + str(columnnum2)]['value'])
        range_str = str(config['a' + str(columnnum2)]['range'])
        #value = float(value_str)

        print(f"value {value_str}")
        print(f"range {range_str}")
        #operanddisc = str(config['a' + str(columnnum2)]['operand'])

        rang_arr = range_str.split(',')
        value_arr = value_str.split(',')

        while (records > 0):
            temp_row = dftemp.iloc[incr].tolist() #column

            #print(temp_row)
            price = temp_row[cols- 1]
            print(f"price = {price}")
            for i in range(len(rang_arr)):
                if (price <= int(rang_arr[i])):
                    temp_disc = value_arr[i]
                    new_list.append(temp_disc)
                    break
                else:
                    continue
            records = records-1
            incr = incr+1
        print(f"new list {new_list}")

        column_name = str(config['a' + str(columnnum2)]['new_col'])
        data_new1 = dftemp.assign(new_col=new_list)
        data_new1.rename(columns={'new_col': column_name}, inplace=True)
        print(data_new1)
        data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
        columnnum2 = columnnum2 + 1

    elif (config['a' + str(columnnum2)]['operation'] == "reference2"):#reference and insert data
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')

        print("mode 2 generate reference2")
        records = dftemp.shape[0]  # number of records to generate
        new_list = []
        incr = 0
        cols = int(config['a' + str(columnnum2)]['cols'])
        value_str = str(config['a' + str(columnnum2)]['value'])
        range_str = str(config['a' + str(columnnum2)]['range'])
        #value = float(value_str)

        print(f"value {value_str}")
        print(f"range {range_str}")
        #operanddisc = str(config['a' + str(columnnum2)]['operand'])

        rang_arr = range_str.split(',')
        value_arr = value_str.split(',')

        while (records > 0):
            temp_row = dftemp.iloc[incr].tolist() #column

            #print(temp_row)
            price = temp_row[cols- 1]
            print(f"price = {price}")
            for i in range(len(rang_arr)):
                if (price == int(value_arr[i])):
                    temp_disc = rang_arr[i]
                    new_list.append(temp_disc)
                    break
                else:
                    continue
            records = records-1
            incr = incr+1
        print(f"new list {new_list}")

        column_name = str(config['a' + str(columnnum2)]['new_col'])
        data_new1 = dftemp.assign(new_col=new_list)
        data_new1.rename(columns={'new_col': column_name}, inplace=True)
        print(data_new1)
        data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
        columnnum2 = columnnum2 + 1

    elif (config['a' + str(columnnum2)]['operation'] == "reference_weight"):#reference and insert data with weightage
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')

        print("mode 2 generate reference_weight2")
        records = dftemp.shape[0]  # number of records to generate
        new_list = []
        incr = 0
        cols = int(config['a' + str(columnnum2)]['cols'])
        value_str = str(config['a' + str(columnnum2)]['value'])
        range_str = str(config['a' + str(columnnum2)]['range'])
        #weights_str = str(config['a' + str(columnnum2)]['weights'])

        defaults = str(config['a' + str(columnnum2)]['default']).split(',')

        #value = float(value_str)
        weights_arr = (config['a' + str(columnnum2)]['weights']).split(',')
        print(f"value {value_str}")
        print(f"range {range_str}")
        #print(f"range {weights_arr}")
        #operanddisc = str(config['a' + str(columnnum2)]['operand'])

        A = np.array(weights_arr)
        A = A.astype(int)
        rang_arr = range_str.split(',')
        value_arr = value_str.split(',')




        while (records > 0):
            temp_row = dftemp.iloc[incr].tolist() #column

            #print(temp_row)
            price = temp_row[cols- 1]
            print(f"price = {price}")
            if(price == 0):
                temp_disc = random.choices(defaults)
                str_temp_disc = "".join(temp_disc)
                new_list.append(str(str_temp_disc))
            elif(price == 1):

                temp_rand = random.choices(rang_arr)
                str_temp_rand = "".join(temp_rand)
                new_list.append(str_temp_rand)

            records = records-1
            incr = incr+1
        print(f"new list {new_list}")

        column_name = str(config['a' + str(columnnum2)]['new_col'])
        data_new1 = dftemp.assign(new_col=new_list)
        data_new1.rename(columns={'new_col': column_name}, inplace=True)
        print(data_new1)
        data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
        columnnum2 = columnnum2 + 1

    elif (config['a' + str(columnnum2)]['operation'] == "reference_with"):
        dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')
        print("mode 2 generate")
        records = dftemp.shape[0]  # number of records to generate
        new_list = []
        incr = 0
        winner_cond = int(config['a' + str(columnnum2)]['winner_condition'])

        ref_col = int(config['a' + str(columnnum2)]['ref_col'])#win/loss
        check_col = int(config['a' + str(columnnum2)]['check_col'])#value column
        while (records > 0):
            temp_row = dftemp.iloc[incr].tolist()

            temp = 0
            if (temp_row[ref_col - 1] == winner_cond):
                temp = temp_row[check_col - 1]

            # print(temp_row)
            temp_disc = temp
            new_list.append(temp_disc)
            records = records - 1
            incr = incr + 1
        column_name = str(config['a' + str(columnnum2)]['new_col'])
        data_new1 = dftemp.assign(new_col=new_list)
        data_new1.rename(columns={'new_col': column_name}, inplace=True)
        print(data_new1)
        data_new1.to_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv', index=False)
        columnnum2 = columnnum2 + 1



def m3():

    '''with open('C:/Users/alden/Desktop/samplecsv/studentsuniquetest2.csv', 'r') as infile, open('C:/Users/alden/Desktop/samplecsv/reordered.csv', 'a',newline="") as outfile:
        # output dict needs a list for new column ordering
        fieldnames = ['first_name','last_name','date_of_birth','email','cgpa','height','weight','total','subjects','colleges','dept_num','unique_id']

        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        # reorder the header first
        writer.writeheader()
        for row in csv.DictReader(infile):
            # writes the reordered rows to the new file
            writer.writerow(row)'''
    dftemp = pd.read_csv('C:/Users/alden/Desktop/samplecsv/salesfunnel.csv')
    print("mode 2 generate")
    records = dftemp.shape[0]  # number of records to generate
    new_list = []
    incr = 0
    order = str(config['reorder']['order']).split(',')
    print(order)
    print(len(order))
    cntr = 0
    while(cntr<=12): #number of columns
        while (records > 0):
            temp_row = dftemp.iloc[incr].tolist()
            temp_val = int(order[cntr])
            price = temp_row[temp_val]
            #print(titanic_data)
            print(temp_row)
            incr = incr+1
            #cntr = cntr+1
            records = records-1
        '''cntr = cntr+1
        records = 0
        incr = 0'''

if(choice == 1):
    start = time.time()
    m1()
    end = time.time()
    print("The time of execution of above program is :", end - start)
elif(choice == 2):
    m2()
elif(choice == 3):
    m3()







